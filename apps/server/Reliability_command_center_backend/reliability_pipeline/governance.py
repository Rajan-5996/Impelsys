"""The governance gate: approvals + audit_log, and the human-callable
approve_incident / reject_incident functions.

Nothing past customer_validation_asset materializes automatically. A failed
asset check writes a 'pending' approvals row + a 'detected' audit_log row.
Only approve_incident() flips the row to 'approved', which the sensor in
sensors.py picks up on its next tick and turns into a RunRequest.
"""
import datetime

from . import policies as policy_store
from .db import ensure_governance_tables, get_connection

PIPELINE = "SALES_DAILY_ETL"
STAGE = "customer_validation_asset"
POLICY = "DQ-POL-017"
MODE = policy_store.mode_for_policy(POLICY)
AGENT = "ETL Resolution Agent"


def record_detection(incident_id: str, supplier: str, evidence: str, env: str = "Production"):
    with get_connection() as conn:
        ensure_governance_tables(conn)
        conn.execute(
            "INSERT INTO approvals (incident_id, pipeline, stage, status, approver, decided_at) "
            "VALUES (?, ?, ?, 'pending', NULL, NULL)",
            [incident_id, PIPELINE, STAGE],
        )
        conn.execute(
            "INSERT INTO audit_log (ts, agent, action, incident_id, supplier, policy, mode, "
            "approver, decision, result, evidence, env) VALUES "
            "(current_timestamp, ?, 'Detected', ?, ?, ?, ?, NULL, NULL, "
            "'Awaiting human approval', ?, ?)",
            [AGENT, incident_id, supplier, POLICY, MODE, evidence, env],
        )


def approve_incident(incident_id: str, approver: str = "dataops_lead", modification_note: str = None):
    """Human unblocks the paused run. The sensor picks this up on its next tick.

    modification_note is set when this approval came through the "Modify Action" path
    (the human adjusted parameters before approving) -- it's recorded in the audit
    evidence but doesn't change the remediation itself, which stays quarantine-and-continue.
    """
    with get_connection() as conn:
        ensure_governance_tables(conn)
        existing = conn.execute(
            "SELECT status FROM approvals WHERE incident_id = ?", [incident_id]
        ).fetchone()
        if existing is None:
            raise ValueError(f"No approval row found for incident_id={incident_id!r}")
        if existing[0] != "pending":
            raise ValueError(
                f"incident_id={incident_id!r} is already {existing[0]!r}, not pending"
            )

        conn.execute(
            "UPDATE approvals SET status = 'approved', approver = ?, decided_at = current_timestamp "
            "WHERE incident_id = ?",
            [approver, incident_id],
        )
        decision = "Modify Action" if modification_note else "Approve & Execute"
        evidence = (
            f"Human approved remediation via approve_incident() with modification: {modification_note}"
            if modification_note
            else "Human approved remediation via approve_incident()"
        )
        conn.execute(
            "INSERT INTO audit_log (ts, agent, action, incident_id, supplier, policy, mode, "
            "approver, decision, result, evidence, env) VALUES "
            "(current_timestamp, ?, 'Approved', ?, NULL, ?, ?, ?, ?, "
            "'Quarantine-and-continue authorized', ?, ?)",
            [AGENT, incident_id, POLICY, MODE, approver, decision, evidence, "Production"],
        )
    return {"incident_id": incident_id, "status": "approved", "approver": approver}


def escalate_incident(incident_id: str, approver: str = "dataops_lead", note: str = None):
    """Routes the incident to a team lead. Stays paused -- only 'approved' triggers the sensor."""
    with get_connection() as conn:
        ensure_governance_tables(conn)
        existing = conn.execute(
            "SELECT status FROM approvals WHERE incident_id = ?", [incident_id]
        ).fetchone()
        if existing is None:
            raise ValueError(f"No approval row found for incident_id={incident_id!r}")
        if existing[0] != "pending":
            raise ValueError(
                f"incident_id={incident_id!r} is already {existing[0]!r}, not pending"
            )

        conn.execute(
            "UPDATE approvals SET status = 'escalated', approver = ?, decided_at = current_timestamp "
            "WHERE incident_id = ?",
            [approver, incident_id],
        )
        conn.execute(
            "INSERT INTO audit_log (ts, agent, action, incident_id, supplier, policy, mode, "
            "approver, decision, result, evidence, env) VALUES "
            "(current_timestamp, ?, 'Escalated', ?, NULL, ?, ?, ?, 'Escalate', "
            "'Routed to team lead', ?, ?)",
            [AGENT, incident_id, POLICY, MODE, approver,
             note or "Escalated for review via escalate_incident()", "Production"],
        )
    return {"incident_id": incident_id, "status": "escalated", "approver": approver}


def reject_incident(incident_id: str, approver: str = "dataops_lead"):
    """Closes the incident without ever triggering the sensor. Pipeline stays paused."""
    with get_connection() as conn:
        ensure_governance_tables(conn)
        existing = conn.execute(
            "SELECT status FROM approvals WHERE incident_id = ?", [incident_id]
        ).fetchone()
        if existing is None:
            raise ValueError(f"No approval row found for incident_id={incident_id!r}")
        if existing[0] != "pending":
            raise ValueError(
                f"incident_id={incident_id!r} is already {existing[0]!r}, not pending"
            )

        conn.execute(
            "UPDATE approvals SET status = 'rejected', approver = ?, decided_at = current_timestamp "
            "WHERE incident_id = ?",
            [approver, incident_id],
        )
        conn.execute(
            "INSERT INTO audit_log (ts, agent, action, incident_id, supplier, policy, mode, "
            "approver, decision, result, evidence, env) VALUES "
            "(current_timestamp, ?, 'Rejected', ?, NULL, ?, ?, ?, 'Reject', "
            "'Incident stays open, manual handling', 'Human rejected remediation via reject_incident()', ?)",
            [AGENT, incident_id, POLICY, MODE, approver, "Production"],
        )
    return {"incident_id": incident_id, "status": "rejected", "approver": approver}


def list_pending_incidents():
    with get_connection() as conn:
        ensure_governance_tables(conn)
        rows = conn.execute(
            "SELECT incident_id, pipeline, stage, status FROM approvals WHERE status = 'pending' "
            "ORDER BY incident_id"
        ).fetchall()
    return [dict(zip(["incident_id", "pipeline", "stage", "status"], r)) for r in rows]


def get_audit_trail(incident_id: str):
    with get_connection() as conn:
        ensure_governance_tables(conn)
        rows = conn.execute(
            "SELECT ts, agent, action, incident_id, supplier, policy, mode, approver, "
            "decision, result, evidence, env FROM audit_log WHERE incident_id = ? ORDER BY ts",
            [incident_id],
        ).fetchall()
    cols = ["ts", "agent", "action", "incident_id", "supplier", "policy", "mode",
            "approver", "decision", "result", "evidence", "env"]
    return [dict(zip(cols, r)) for r in rows]


def new_incident_id(run_id: str, prefix: str = "INC") -> str:
    stamp = datetime.datetime.utcnow().strftime("%Y%m%d")
    return f"{prefix}-{stamp}-{run_id[:8]}"


def record_observation(event_id: str, policy_id: str, supplier: str, evidence: str, env: str = "Production"):
    """Observe Only: the agent investigates and reports, but takes no action --
    no approvals row, since there's nothing pending and nothing for a human to
    decide. This is the mode's whole point: report, don't block, don't act.
    """
    mode = policy_store.mode_for_policy(policy_id)
    with get_connection() as conn:
        ensure_governance_tables(conn)
        conn.execute(
            "INSERT INTO audit_log (ts, agent, action, incident_id, supplier, policy, mode, "
            "approver, decision, result, evidence, env) VALUES "
            "(current_timestamp, 'Data Quality Agent', 'Observed', ?, ?, ?, ?, "
            "'Not applicable', 'Not applicable', 'No action required', ?, ?)",
            [event_id, supplier, policy_id, mode, evidence, env],
        )
    return {"event_id": event_id, "policy": policy_id, "mode": mode, "action": "Observed"}


def record_autonomous_action(event_id: str, policy_id: str, supplier: str, evidence: str, env: str = "Production"):
    """Policy-Controlled Autonomous: the agent executes automatically within
    policy bounds -- no approvals row, since nothing waits for a human. Unlike
    Human Approval Required, the audit trail records the action as already
    taken, not pending.
    """
    mode = policy_store.mode_for_policy(policy_id)
    with get_connection() as conn:
        ensure_governance_tables(conn)
        conn.execute(
            "INSERT INTO audit_log (ts, agent, action, incident_id, supplier, policy, mode, "
            "approver, decision, result, evidence, env) VALUES "
            "(current_timestamp, 'Data Quality Agent', 'Auto-Accepted', ?, ?, ?, ?, "
            "'System (Policy-Controlled)', 'Auto-approved', 'No pipeline impact', ?, ?)",
            [event_id, supplier, policy_id, mode, evidence, env],
        )
    return {"event_id": event_id, "policy": policy_id, "mode": mode, "action": "Auto-Accepted"}
