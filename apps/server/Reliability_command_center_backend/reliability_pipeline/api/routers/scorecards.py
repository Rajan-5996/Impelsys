"""Supplier Scorecards (README section 7.2). NorthStar Data / DataSphere now carry
real scores -- warehouse_load_asset recomputes them from actual pipeline run data
each time an incident resolves (see scoring.py + assets.py). The other 10
suppliers stay mock: real per-supplier scoring across all 12 requires the Data
Quality & Supplier Intelligence Agent's historical scoring model, which is out
of scope for this pipeline build.
"""
from fastapi import APIRouter

from .. import db_reader
from ..mock_data import SUPPLIERS

router = APIRouter(prefix="/api/scorecards", tags=["scorecards"])

_BREAKDOWN_METRICS = ["Timeliness", "Volume Accuracy", "Schema Stability", "Data Quality", "SLA Compliance"]


def _scorecard(supplier: dict) -> dict:
    real_score = db_reader.get_supplier_score(supplier["name"]) if supplier.get("isReal") else None

    if real_score:
        base = real_score["score"]
        tier = real_score["tier"]
        trend = real_score["trend"]
        is_real = True
    else:
        base = supplier["score"]
        tier = supplier["tier"]
        trend = [max(0, base - 4), max(0, base - 2), base]
        is_real = False

    breakdown = {m: max(0, min(100, base + (i - 2) * 3)) for i, m in enumerate(_BREAKDOWN_METRICS)}
    return {
        "supplierId": supplier["id"],
        "name": supplier["name"],
        "score": base,
        "tier": tier,
        "breakdown": breakdown,
        "trend": trend,
        "isReal": is_real,
    }


@router.get("")
def list_scorecards():
    scorecards = sorted((_scorecard(s) for s in SUPPLIERS), key=lambda s: s["score"], reverse=True)
    preferred_candidates = [s for s in scorecards if s["tier"] == "Approved" and s["score"] >= 85]
    downgrade_watch = [s for s in scorecards if s["tier"] in ("Monitor", "At Risk")]
    return {
        "scorecards": scorecards,
        "tierMovementWatchlist": {
            "preferredCandidates": preferred_candidates,
            "downgradeWatch": downgrade_watch,
        },
    }
