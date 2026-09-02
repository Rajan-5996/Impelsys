from dagster import AssetSelection, define_asset_job

from .assets import customer_validation_asset

full_pipeline_job = define_asset_job(
    name="full_pipeline_job",
    selection=AssetSelection.all(),
    description="Materializes all 7 SALES_DAILY_ETL assets. On the seeded data, "
    "the customer_validation_asset check always fails and blocks everything past it "
    "until a human calls approve_incident().",
)

resume_after_approval_job = define_asset_job(
    name="resume_after_approval_job",
    selection=AssetSelection.assets(customer_validation_asset).downstream(include_self=False),
    description="Re-materializes product_mapping_asset onward, reading the "
    "already-quarantined customer_validation_pass table. Triggered only by "
    "approval_sensor after a human approves an incident.",
)
