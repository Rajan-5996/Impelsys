"""Data Quality: real dimensions/rules for daily_sales_curated, mock for the other
4 curated datasets whose pipelines are out of scope (README section 7.1)."""
from fastapi import APIRouter, HTTPException

from .. import db_reader
from ..mock_data import OTHER_DATASETS, QUALITY_DIMENSIONS

router = APIRouter(prefix="/api/data-quality", tags=["data-quality"])


@router.get("/dimensions")
def list_quality_dimensions():
    return {"dimensions": QUALITY_DIMENSIONS}


@router.get("/datasets")
def list_datasets():
    real = db_reader.get_daily_sales_curated_quality()
    real_summary = {
        "id": "daily_sales_curated",
        "name": "Daily Sales Curated",
        "score": round(sum(d["score"] for d in real["dimensions"]) / len(real["dimensions"]), 1)
        if real["dimensions"] else None,
        "recordCount": real["recordCount"],
        "rulesTotal": len(real["rules"]),
        "passed": sum(1 for r in real["rules"] if r["status"] == "Passed"),
        "warning": 0,
        "failed": sum(1 for r in real["rules"] if r["status"] == "Failed"),
        "isReal": True,
    }
    return {"datasets": [real_summary] + [{**d, "isReal": False} for d in OTHER_DATASETS]}


@router.get("/datasets/daily_sales_curated")
def get_daily_sales_curated():
    return db_reader.get_daily_sales_curated_quality()


@router.get("/datasets/{dataset_id}")
def get_other_dataset(dataset_id: str):
    match = next((d for d in OTHER_DATASETS if d["id"] == dataset_id), None)
    if match is None:
        raise HTTPException(status_code=404, detail=f"No dataset found with id {dataset_id!r}")
    return match


@router.get("/failed-rules")
def list_failed_rules():
    real = db_reader.get_daily_sales_curated_quality()
    failed = [
        {**r, "dataset": "daily_sales_curated"}
        for r in real["rules"] if r["status"] == "Failed"
    ]
    return {"failedRules": failed}
