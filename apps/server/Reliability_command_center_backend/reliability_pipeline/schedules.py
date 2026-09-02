"""Stands in for a real feed-arrival trigger. Real supplier connectors (SFTP/API
pollers watching for new files) are out of scope for this build -- without this
schedule, full_pipeline_job never starts on its own; someone has to manually
materialize it in the Dagster UI, via the CLI, or via a GraphQL/API call.

This is a schedule, not a sensor, because there's nothing real to watch for: the
sample data is static local files, not an actual drop location. A schedule at
least makes the pipeline self-triggering instead of requiring a manual click
every time -- swap this for a real sensor once there's an actual feed source
to watch (SFTP arrival, cloud storage event, webhook, etc.).
"""
from dagster import DefaultScheduleStatus, ScheduleDefinition

from .jobs import full_pipeline_job

sales_daily_etl_schedule = ScheduleDefinition(
    name="sales_daily_etl_schedule",
    job=full_pipeline_job,
    cron_schedule="0 6 * * *",  # 06:00 daily -- matches the supplier feeds' typical arrival window
    default_status=DefaultScheduleStatus.RUNNING,
    description=(
        "Stands in for a real feed-arrival trigger (SFTP/API pollers are out of scope for "
        "this build). Re-materializes full_pipeline_job once a day. Each run re-detects the "
        "same seeded NULL CUSTOMER_ID rows and raises a fresh incident -- use the Dagster "
        "UI's 'Test Schedule' button to fire it immediately without waiting for the cron time."
    ),
)
