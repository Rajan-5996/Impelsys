"""Read-only queries against the real DuckDB tables, used by the API routers.
Everything here reflects actual pipeline/governance state -- no mock data.
"""
import re

from ..db import ensure_governance_tables, ensure_history_tables, get_connection

_CONF_RE = re.compile(r"Confidence:\s*(\d+)\s*%", re.IGNORECASE)
_RISK_RE = re.compile(r"Risk:\s*(LOW|MEDIUM|HIGH)", re.IGNORECASE)


def _parse_confidence(evidence: str):
    m = _CONF_RE.search(evidence or "")
    return int(m.group(1)) / 100.0 if m else None


def _parse_risk(evidence: str):
    m = _RISK_RE.search(evidence or "")
    return m.group(1).upper() if m else None


def table_exists(conn, name: str) -> bool:
    row = conn.execute(
        "SELECT count(*) FROM information_schema.tables WHERE table_name = ?", [name]
    ).fetchone()
    return row[0] > 0


def get_pipeline_status():
    """Best-effort stage-by-stage status for SALES_DAILY_ETL, derived entirely from
    DuckDB table state + the audit_log/approvals governance trail -- no dependency
    on the Dagster instance being reachable from this process.
    """
    with get_connection() as conn:
        ensure_governance_tables(conn)

        stages = {
            name: {"name": name, "status": "Not Run", "metadata": {}}
            for name in [
                "landing_asset", "schema_validation_asset", "customer_validation_asset",
                "product_mapping_asset", "transformation_asset", "business_rules_asset",
                "warehouse_load_asset",
            ]
        }

        if not table_exists(conn, "landing_daily_sales"):
            return {"pipeline": "SALES_DAILY_ETL", "stages": list(stages.values()), "activeIncidentId": None}

        landed = conn.execute("SELECT count(*) FROM landing_daily_sales").fetchone()[0]
        stages["landing_asset"] = {"name": "landing_asset", "status": "Success", "metadata": {"row_count": landed}}
        stages["schema_validation_asset"] = {"name": "schema_validation_asset", "status": "Success", "metadata": {}}

        detected = conn.execute(
            "SELECT ts, incident_id, evidence FROM audit_log WHERE action = 'Detected' ORDER BY ts DESC LIMIT 1"
        ).fetchall()

        if not detected:
            stages["customer_validation_asset"] = {
                "name": "customer_validation_asset", "status": "Not Run", "metadata": {},
            }
            return {"pipeline": "SALES_DAILY_ETL", "stages": list(stages.values()), "activeIncidentId": None}

        _, incident_id, evidence = detected[0]
        approval = conn.execute(
            "SELECT status FROM approvals WHERE incident_id = ?", [incident_id]
        ).fetchone()
        approval_status = approval[0] if approval else "pending"

        stages["customer_validation_asset"] = {
            "name": "customer_validation_asset",
            "status": "Success" if approval_status == "approved" else "Failed",
            "metadata": {
                "incident_id": incident_id,
                "confidence": _parse_confidence(evidence),
                "risk": _parse_risk(evidence),
            },
        }

        downstream_names = [
            "product_mapping_asset", "transformation_asset", "business_rules_asset", "warehouse_load_asset",
        ]

        if approval_status == "pending":
            for n in downstream_names:
                stages[n] = {"name": n, "status": "Blocked - Awaiting Approval", "metadata": {}}
        elif approval_status == "rejected":
            for n in downstream_names:
                stages[n] = {"name": n, "status": "Skipped - Rejected", "metadata": {}}
        elif approval_status == "escalated":
            for n in downstream_names:
                stages[n] = {"name": n, "status": "Blocked - Escalated", "metadata": {}}
        is_resolved = False
        if approval_status == "approved":
            resolved = conn.execute(
                "SELECT result FROM audit_log WHERE incident_id = ? AND action = 'Resolved' "
                "ORDER BY ts DESC LIMIT 1",
                [incident_id],
            ).fetchone()
            is_resolved = resolved is not None
            if is_resolved:
                for n in downstream_names:
                    stages[n] = {"name": n, "status": "Success", "metadata": {"result": resolved[0]}}
            else:
                for n in downstream_names:
                    stages[n] = {"name": n, "status": "In Progress", "metadata": {}}

        return {
            "pipeline": "SALES_DAILY_ETL",
            "stages": list(stages.values()),
            "activeIncidentId": None if is_resolved else incident_id,
        }


def get_etl_incident_detail(incident_id: str):
    with get_connection() as conn:
        ensure_governance_tables(conn)
        approval = conn.execute(
            "SELECT incident_id, pipeline, stage, status, approver, decided_at "
            "FROM approvals WHERE incident_id = ?",
            [incident_id],
        ).fetchone()
        if approval is None:
            return None

        audit_rows = conn.execute(
            "SELECT ts, agent, action, incident_id, supplier, policy, mode, approver, "
            "decision, result, evidence, env FROM audit_log WHERE incident_id = ? ORDER BY ts",
            [incident_id],
        ).fetchall()

        exception_count = None
        by_supplier = {}
        if table_exists(conn, "customer_validation_exception"):
            exception_count = conn.execute("SELECT count(*) FROM customer_validation_exception").fetchone()[0]
            by_supplier = dict(
                conn.execute(
                    "SELECT source_supplier, count(*) FROM customer_validation_exception GROUP BY source_supplier"
                ).fetchall()
            )

    detected = next((r for r in audit_rows if r[2] == "Detected"), None)
    evidence = detected[10] if detected else None

    cols = ["ts", "agent", "action", "incident_id", "supplier", "policy", "mode",
            "approver", "decision", "result", "evidence", "env"]
    timeline = [dict(zip(cols, r)) for r in audit_rows]

    return {
        "id": incident_id,
        "pipeline": approval[1],
        "stage": approval[2],
        "status": approval[3],
        "approver": approval[4],
        "decidedAt": approval[5],
        "ruleViolated": "DQ-001: CUSTOMER_ID NOT NULL",
        "exceptionCount": exception_count,
        "bySupplier": by_supplier,
        "evidence": evidence,
        "confidence": _parse_confidence(evidence) if evidence else None,
        "riskRating": _parse_risk(evidence) if evidence else None,
        "policy": "DQ-POL-017",
        "governanceMode": "Human Approval Required",
        "timeline": timeline,
    }


def list_etl_incidents():
    with get_connection() as conn:
        ensure_governance_tables(conn)
        rows = conn.execute(
            "SELECT incident_id, pipeline, stage, status, approver, decided_at "
            "FROM approvals ORDER BY incident_id DESC"
        ).fetchall()
    return [
        {"id": r[0], "pipeline": r[1], "stage": r[2], "status": r[3], "approver": r[4], "decidedAt": r[5]}
        for r in rows
    ]


def get_audit_log(limit: int = 50, offset: int = 0, incident_id: str = None, action: str = None):
    with get_connection() as conn:
        ensure_governance_tables(conn)
        where = []
        params = []
        if incident_id:
            where.append("incident_id = ?")
            params.append(incident_id)
        if action:
            where.append("action = ?")
            params.append(action)
        clause = f"WHERE {' AND '.join(where)}" if where else ""

        total = conn.execute(f"SELECT count(*) FROM audit_log {clause}", params).fetchone()[0]
        rows = conn.execute(
            f"SELECT ts, agent, action, incident_id, supplier, policy, mode, approver, "
            f"decision, result, evidence, env FROM audit_log {clause} ORDER BY ts DESC LIMIT ? OFFSET ?",
            params + [limit, offset],
        ).fetchall()

    cols = ["ts", "agent", "action", "incidentId", "supplier", "policy", "mode",
            "approver", "decision", "result", "evidence", "env"]
    return {"total": total, "limit": limit, "offset": offset, "entries": [dict(zip(cols, r)) for r in rows]}


def get_daily_sales_curated_quality():
    with get_connection() as conn:
        ensure_history_tables(conn)
        if not table_exists(conn, "quality_dimensions"):
            return {"dataset": "daily_sales_curated", "dimensions": [], "rules": [], "recordCount": None}

        latest_run = conn.execute(
            "SELECT run_id FROM quality_dimensions WHERE dataset = 'daily_sales_curated' "
            "ORDER BY ts DESC LIMIT 1"
        ).fetchone()
        if not latest_run:
            return {"dataset": "daily_sales_curated", "dimensions": [], "rules": [], "recordCount": None}
        run_id = latest_run[0]

        dims = conn.execute(
            "SELECT dimension, score FROM quality_dimensions WHERE run_id = ? AND dataset = 'daily_sales_curated'",
            [run_id],
        ).fetchall()
        rules = conn.execute(
            "SELECT rule_code, rule_description, status, affected_count, checked_count "
            "FROM dataset_rules WHERE run_id = ? AND dataset = 'daily_sales_curated'",
            [run_id],
        ).fetchall()
        record_count = None
        if table_exists(conn, "daily_sales_curated"):
            record_count = conn.execute("SELECT count(*) FROM daily_sales_curated").fetchone()[0]

    return {
        "dataset": "daily_sales_curated",
        "runId": run_id,
        "recordCount": record_count,
        "dimensions": [{"dimension": d, "score": s} for d, s in dims],
        "rules": [
            {"ruleCode": rc, "description": rd, "status": st, "affectedCount": ac, "checkedCount": cc}
            for rc, rd, st, ac, cc in rules
        ],
    }


def get_supplier_feed_stats(supplier_name: str):
    """Real per-supplier stats derived from landing_daily_sales, for NorthStar Data / DataSphere."""
    with get_connection() as conn:
        if not table_exists(conn, "landing_daily_sales"):
            return None
        row = conn.execute(
            "SELECT count(*), sum(CASE WHEN CUSTOMER_ID IS NULL THEN 1 ELSE 0 END), max(landed_at) "
            "FROM landing_daily_sales WHERE source_supplier = ?",
            [supplier_name],
        ).fetchone()
    if row is None or row[0] == 0:
        return None
    total, null_customer_id, landed_at = row
    return {"recordCount": total, "nullCustomerIdCount": null_customer_id, "lastLandedAt": landed_at}


def get_sales_daily_etl_summary():
    """Real, current-state summary of the SALES_DAILY_ETL / customer_validation_asset
    incident, for the Ask endpoint -- grounds its answer in actual DuckDB state instead
    of a hardcoded string."""
    with get_connection() as conn:
        ensure_governance_tables(conn)
        if not table_exists(conn, "landing_daily_sales"):
            return {"hasRun": False}

        total = conn.execute("SELECT count(*) FROM landing_daily_sales").fetchone()[0]

        detected = conn.execute(
            "SELECT incident_id FROM audit_log WHERE action = 'Detected' ORDER BY ts DESC LIMIT 1"
        ).fetchone()
        if not detected:
            return {"hasRun": True, "total": total, "incidentId": None, "status": "no_incident"}

        incident_id = detected[0]
        approval = conn.execute(
            "SELECT status FROM approvals WHERE incident_id = ?", [incident_id]
        ).fetchone()
        status = approval[0] if approval else "pending"

        exception_count = conn.execute("SELECT count(*) FROM customer_validation_exception").fetchone()[0] \
            if table_exists(conn, "customer_validation_exception") else None

        resolved_row = conn.execute(
            "SELECT result FROM audit_log WHERE incident_id = ? AND action = 'Resolved' ORDER BY ts DESC LIMIT 1",
            [incident_id],
        ).fetchone()

    return {
        "hasRun": True,
        "total": total,
        "incidentId": incident_id,
        "status": status,
        "exceptionCount": exception_count,
        "validCount": (total - exception_count) if exception_count is not None else None,
        "resolvedResult": resolved_row[0] if resolved_row else None,
    }


def get_supplier_score(supplier_name: str, trend_limit: int = 14):
    """Real score/tier history for NorthStar Data / DataSphere, computed by
    warehouse_load_asset from actual pipeline run data. None if no run has
    resolved yet for this supplier."""
    with get_connection() as conn:
        ensure_history_tables(conn)
        if not table_exists(conn, "supplier_scores"):
            return None

        latest = conn.execute(
            "SELECT ts, run_id, completeness, referential_integrity, score, tier "
            "FROM supplier_scores WHERE supplier = ? ORDER BY ts DESC LIMIT 1",
            [supplier_name],
        ).fetchone()
        if latest is None:
            return None

        trend = conn.execute(
            "SELECT score FROM supplier_scores WHERE supplier = ? ORDER BY ts ASC LIMIT ?",
            [supplier_name, trend_limit],
        ).fetchall()

    ts, run_id, completeness, referential_integrity, score, tier = latest
    return {
        "ts": ts,
        "runId": run_id,
        "completeness": completeness,
        "referentialIntegrity": referential_integrity,
        "score": score,
        "tier": tier,
        "trend": [r[0] for r in trend],
    }
