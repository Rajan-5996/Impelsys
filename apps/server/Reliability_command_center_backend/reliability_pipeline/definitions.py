from dagster import Definitions

from .assets import (
    business_rules_asset,
    customer_validation_asset,
    landing_asset,
    product_mapping_asset,
    schema_validation_asset,
    transformation_asset,
    warehouse_load_asset,
)
from .checks import customer_id_not_null_check
from .jobs import full_pipeline_job, resume_after_approval_job
from .schedules import sales_daily_etl_schedule
from .sensors import approval_sensor

defs = Definitions(
    assets=[
        landing_asset,
        schema_validation_asset,
        customer_validation_asset,
        product_mapping_asset,
        transformation_asset,
        business_rules_asset,
        warehouse_load_asset,
    ],
    asset_checks=[customer_id_not_null_check],
    jobs=[full_pipeline_job, resume_after_approval_job],
    sensors=[approval_sensor],
    schedules=[sales_daily_etl_schedule],
)
