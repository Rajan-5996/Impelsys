"""Supplier Monitor: 12 suppliers. NorthStar Data / DataSphere are enriched with real
feed stats from landing_daily_sales; the other 10 stay static mock fixtures (README 3.1)."""
from fastapi import APIRouter, HTTPException

from .. import db_reader
from ..mock_data import SUPPLIERS

router = APIRouter(prefix="/api/suppliers", tags=["suppliers"])


def _enrich(supplier: dict) -> dict:
    if not supplier.get("isReal"):
        return supplier
    stats = db_reader.get_supplier_feed_stats(supplier["name"])
    real_score = db_reader.get_supplier_score(supplier["name"])
    enriched = {**supplier, "liveFeedStats": stats}
    if real_score:
        enriched["score"] = real_score["score"]
        enriched["tier"] = real_score["tier"]
    return enriched


@router.get("")
def list_suppliers():
    return {"suppliers": [_enrich(s) for s in SUPPLIERS]}


@router.get("/{supplier_id}")
def get_supplier(supplier_id: str):
    match = next((s for s in SUPPLIERS if s["id"] == supplier_id), None)
    if match is None:
        raise HTTPException(status_code=404, detail=f"No supplier found with id {supplier_id!r}")
    return _enrich(match)
