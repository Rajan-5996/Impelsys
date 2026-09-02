"""Asset check on customer_validation_asset. A blocking failure here is what
stops the run before product_mapping_asset onward -- and is the only place
that calls the LLM (root-cause narrative + confidence/risk) for the
audit_log.evidence field.
"""
from dagster import AssetCheckExecutionContext, AssetCheckResult, AssetCheckSeverity, asset_check

from . import governance
from .assets import customer_validation_asset
from .db import get_connection
from .knowledge_base import SIMILAR_INCIDENTS
from .llm_client import call_llm


def _build_prompt(batch_id: str, total_exceptions: int, by_supplier: dict) -> str:
    precedent = "\n".join(
        f"- [{inc['similarity']:.0%} match] {inc['incident_id']}: {inc['summary']}"
        for inc in SIMILAR_INCIDENTS
    )
    supplier_breakdown = "\n".join(f"- {supplier}: {count} records" for supplier, count in by_supplier.items())
    return f"""You are the ETL Resolution Agent for a data reliability platform. A data quality
check just failed on the customer_validation_asset stage of the SALES_DAILY_ETL pipeline.

Batch ID: {batch_id}
Rule violated: DQ-001 (CUSTOMER_ID NOT NULL)
Total affected records: {total_exceptions}
Breakdown by supplier:
{supplier_breakdown}

Three historically similar incidents from the knowledge base:
{precedent}

Write a concise root-cause conclusion (2-4 sentences) for why these records likely failed,
citing the closest historical precedent. Then on a new line write "Confidence: NN%" with your
confidence in that conclusion, and on another new line write "Risk: LOW|MEDIUM|HIGH" for the
risk of proceeding with a quarantine-and-continue remediation (keep the good records flowing,
hold the bad ones for supplier follow-up)."""


@asset_check(asset=customer_validation_asset, blocking=True, description="DQ-001: CUSTOMER_ID NOT NULL")
def customer_id_not_null_check(context: AssetCheckExecutionContext) -> AssetCheckResult:
    with get_connection() as conn:
        exception_count = conn.execute("SELECT count(*) FROM customer_validation_exception").fetchone()[0]
        if exception_count == 0:
            return AssetCheckResult(passed=True, metadata={"exception_count": 0})

        by_supplier_rows = conn.execute(
            "SELECT source_supplier, count(*) FROM customer_validation_exception GROUP BY source_supplier"
        ).fetchall()
        by_supplier = dict(by_supplier_rows)
        primary_supplier = max(by_supplier, key=by_supplier.get)

    batch_id = context.run.run_id
    incident_id = governance.new_incident_id(batch_id)

    prompt = _build_prompt(batch_id, exception_count, by_supplier)
    evidence = call_llm(prompt)

    governance.record_detection(incident_id=incident_id, supplier=primary_supplier, evidence=evidence)

    context.log.warning(
        f"DQ-001 failed: {exception_count} records with NULL CUSTOMER_ID. "
        f"Incident {incident_id} is now pending human approval -- call "
        f"governance.approve_incident({incident_id!r}) or governance.reject_incident({incident_id!r})."
    )

    return AssetCheckResult(
        passed=False,
        severity=AssetCheckSeverity.ERROR,
        metadata={
            "exception_count": exception_count,
            "incident_id": incident_id,
            "by_supplier": str(by_supplier),
            "llm_evidence": evidence,
        },
    )
