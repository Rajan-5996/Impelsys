"""Pipeline Operations: real, live SALES_DAILY_ETL stage status."""
from fastapi import APIRouter

from .. import db_reader

router = APIRouter(prefix="/api/pipelines", tags=["pipelines"])


@router.get("/sales-daily-etl")
def get_sales_daily_etl_status():
    return db_reader.get_pipeline_status()
