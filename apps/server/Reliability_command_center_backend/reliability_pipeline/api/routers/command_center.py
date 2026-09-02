"""Command Center: top-row KPIs + the "Needs Attention" action queue (README section 3).
Blends the real ETL incident(s) with the two out-of-scope mock scenarios."""
from fastapi import APIRouter

from ... import governance
from .. import db_reader
from ..mock_data import GLOBALFEEDS_ALERT, NORTHSTAR_INCIDENT, OTHER_DATASETS, SUPPLIERS

router = APIRouter(prefix="/api/command-center", tags=["command-center"])


@router.get("/kpis")
def get_kpis():
    pending = governance.list_pending_incidents()
    quality = db_reader.get_daily_sales_curated_quality()
    real_score = (
        round(sum(d["score"] for d in quality["dimensions"]) / len(quality["dimensions"]), 1)
        if quality["dimensions"] else None
    )
    all_scores = [s for s in ([real_score] if real_score is not None else []) + [d["score"] for d in OTHER_DATASETS]]
    avg_quality = round(sum(all_scores) / len(all_scores), 1) if all_scores else None

    return {
        "activeIncidents": len(pending) + 1,  # +1 for the mock NorthStar incident, always "Awaiting Approval"
        "pendingApprovals": len(pending) + 1,
        "suppliersAtRisk": sum(1 for s in SUPPLIERS if s["tier"] == "At Risk"),
        "avgDataQualityScore": avg_quality,
    }


@router.get("/attention-queue")
def get_attention_queue():
    items = [NORTHSTAR_INCIDENT, GLOBALFEEDS_ALERT]
    for inc in governance.list_pending_incidents():
        detail = db_reader.get_etl_incident_detail(inc["incident_id"])
        if detail:
            items.append({
                "id": detail["id"],
                "title": "SALES_DAILY_ETL customer_validation_asset failure",
                "supplier": max(detail["bySupplier"], key=detail["bySupplier"].get) if detail["bySupplier"] else None,
                "pipeline": detail["pipeline"],
                "stage": detail["stage"],
                "severity": "High",
                "status": "Awaiting Approval",
                "governanceMode": detail["governanceMode"],
                "policy": detail["policy"],
                "confidence": detail["confidence"],
                "riskRating": detail["riskRating"],
                "evidence": detail["evidence"],
            })
    return {"items": items}
