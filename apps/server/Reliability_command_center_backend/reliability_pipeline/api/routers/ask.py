"""Backend equivalent of command-center.html's "Ask DataOps Agent" widget.

The frontend's version (`var Ask = {...}` in the prototype) is a pure client-side
keyword-matcher against hardcoded strings -- it never calls a backend at all. This
endpoint answers the same categories of question (NorthStar, SALES_DAILY_ETL,
GlobalFeeds, other suppliers), but the SALES_DAILY_ETL answer is grounded in real
DuckDB state instead of a fixed string, and anything that doesn't match a known
pattern falls through to a real LLM call (grounded with a snapshot of current
pipeline/supplier state) instead of a canned "I can't help with that."
"""
from fastapi import APIRouter

from ... import llm_client
from .. import db_reader
from ..mock_data import GLOBALFEEDS_ALERT, NORTHSTAR_INCIDENT, SUPPLIERS
from ..schemas import AskRequest

router = APIRouter(prefix="/api/ask", tags=["ask"])

SUGGESTIONS = [
    "Why did NorthStar fail today?",
    "What is the status of SALES_DAILY_ETL?",
    "Why is GlobalFeeds reliability declining?",
]


@router.get("/suggestions")
def get_suggestions():
    return {"suggestions": SUGGESTIONS}


def _answer_northstar():
    return {
        "answer": (
            f"NorthStar Data's feed anomaly ({NORTHSTAR_INCIDENT['evidence']}) is a mock "
            f"scenario -- real supplier volume monitoring is out of scope for this build. "
            f"Recommendation on file: {NORTHSTAR_INCIDENT['recommendation']}"
        ),
        "link": {"screen": "incident", "id": NORTHSTAR_INCIDENT["id"]},
        "grounded": False,
    }


def _answer_sales_daily_etl():
    summary = db_reader.get_sales_daily_etl_summary()

    if not summary["hasRun"]:
        return {
            "answer": "SALES_DAILY_ETL hasn't been run yet in this environment -- no "
            "landing_daily_sales table exists. Materialize the pipeline to generate an incident.",
            "link": {"screen": "pipeline"},
            "grounded": True,
        }

    if summary["incidentId"] is None:
        return {
            "answer": f"SALES_DAILY_ETL landed {summary['total']} records with no "
            "CUSTOMER_ID violations -- no incident has been raised.",
            "link": {"screen": "pipeline"},
            "grounded": True,
        }

    status = summary["status"]
    incident_id = summary["incidentId"]
    if status == "pending":
        text = (
            f"SALES_DAILY_ETL is currently held at the Customer Validation checkpoint: "
            f"{summary['exceptionCount']} of {summary['total']} records are failing the "
            f"CUSTOMER_ID NOT NULL constraint, awaiting human approval on incident {incident_id}."
        )
    elif status == "escalated":
        text = (
            f"SALES_DAILY_ETL incident {incident_id} ({summary['exceptionCount']} of "
            f"{summary['total']} records failing CUSTOMER_ID NOT NULL) has been escalated "
            "to a team lead and is still paused."
        )
    elif status == "rejected":
        text = (
            f"SALES_DAILY_ETL incident {incident_id} was rejected -- it stays open for "
            "manual handling and the pipeline remains paused past Customer Validation."
        )
    elif summary["resolvedResult"]:
        text = f"SALES_DAILY_ETL has been resolved. {summary['resolvedResult']}."
    else:
        text = (
            f"SALES_DAILY_ETL incident {incident_id} was approved and is resuming "
            "(the sensor-triggered run hasn't finished yet)."
        )

    return {
        "answer": text,
        "link": {"screen": "incident", "id": incident_id},
        "grounded": True,
    }


def _answer_globalfeeds():
    return {
        "answer": GLOBALFEEDS_ALERT["evidence"] + " (mock scenario -- real cross-run supplier "
        "reliability trending is out of scope for this build.) Recommendation: "
        + GLOBALFEEDS_ALERT["recommendation"],
        "link": {"screen": "supplier", "id": "SUP-003"},
        "grounded": False,
    }


def _answer_supplier(supplier: dict):
    stats = db_reader.get_supplier_feed_stats(supplier["name"]) if supplier.get("isReal") else None
    text = (
        f"{supplier['name']} currently has a health status of {supplier['healthStatus']} "
        f"with a reliability score of {supplier['score']} ({supplier['tier']} tier)."
    )
    if stats:
        text += f" Live feed data: {stats['recordCount']} records landed, {stats['nullCustomerIdCount']} with a NULL CUSTOMER_ID."
    return {
        "answer": text,
        "link": {"screen": "supplier", "id": supplier["id"]},
        "grounded": bool(stats),
    }


def _fallback_llm(question: str):
    pipeline_summary = db_reader.get_sales_daily_etl_summary()
    supplier_names = ", ".join(s["name"] for s in SUPPLIERS)
    context = (
        f"Current SALES_DAILY_ETL state: {pipeline_summary}. "
        f"Known suppliers: {supplier_names}. "
        "Answer briefly (2-3 sentences), and say plainly if you don't have enough "
        "information rather than guessing."
    )
    try:
        answer = llm_client.call_llm(
            f"You are the DataOps Agent for a data reliability command center. "
            f"Context:\n{context}\n\nQuestion: {question}"
        )
        return {"answer": answer, "link": None, "grounded": True}
    except Exception:
        return {
            "answer": "I can help with suppliers, incidents, pipelines, datasets, rules and "
            "policies. Try asking about NorthStar Data, SALES_DAILY_ETL or GlobalFeeds.",
            "link": None,
            "grounded": False,
        }


@router.post("")
def ask(body: AskRequest):
    ql = body.question.lower()

    if "northstar" in ql:
        return _answer_northstar()
    if any(k in ql for k in ("sales_daily", "datasphere", "customer validation", "etl")):
        return _answer_sales_daily_etl()
    if "globalfeeds" in ql:
        return _answer_globalfeeds()

    supplier = next((s for s in SUPPLIERS if s["name"].lower() in ql), None)
    if supplier:
        return _answer_supplier(supplier)

    return _fallback_llm(body.question)
