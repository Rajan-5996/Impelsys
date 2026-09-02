"""The governance-gate sensor: polls approvals.status and, once a row flips to
'approved', issues a RunRequest that resumes the downstream assets. RunRequest's
run_key naturally dedupes -- an already-triggered incident is never resumed twice.
"""
from dagster import DefaultSensorStatus, RunRequest, SensorEvaluationContext, sensor

from .db import ensure_governance_tables, get_connection
from .jobs import resume_after_approval_job


@sensor(
    job=resume_after_approval_job,
    minimum_interval_seconds=15,
    default_status=DefaultSensorStatus.RUNNING,
)
def approval_sensor(context: SensorEvaluationContext):
    with get_connection() as conn:
        ensure_governance_tables(conn)
        approved = conn.execute(
            "SELECT incident_id FROM approvals WHERE status = 'approved' ORDER BY decided_at"
        ).fetchall()

    if not approved:
        return

    for (incident_id,) in approved:
        yield RunRequest(
            run_key=f"resume-{incident_id}",
            tags={"incident_id": incident_id},
        )
