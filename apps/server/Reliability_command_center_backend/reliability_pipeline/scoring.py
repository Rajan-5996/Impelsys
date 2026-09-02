"""Shared supplier scoring/tier logic -- used by warehouse_load_asset (real
computation, for NorthStar Data / DataSphere) and the API's scorecards router
(mock formula for the other 10 suppliers), so both sides agree on what a score
actually means.
"""


def tier_for_score(score: float) -> str:
    if score >= 90:
        return "Preferred"
    if score >= 75:
        return "Approved"
    if score >= 60:
        return "Monitor"
    return "At Risk"
