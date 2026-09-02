"""Agent Workspace (README section 7.3). Agent profiles are mock, but the ETL
Resolution Agent's "awaiting approval" counter reflects the real pending-incident count."""
from fastapi import APIRouter

from ... import governance
from .. import db_reader
from ..mock_data import AGENTS

router = APIRouter(prefix="/api/agents", tags=["agents"])


def _enrich(agent: dict) -> dict:
    if agent["id"] != "AGENT-ETL":
        return {**agent, "awaitingApproval": 0}
    return {**agent, "awaitingApproval": len(governance.list_pending_incidents())}


@router.get("")
def list_agents():
    return {"agents": [_enrich(a) for a in AGENTS]}


@router.get("/{agent_id}/activity")
def get_agent_activity(agent_id: str):
    if agent_id != "AGENT-ETL":
        return {"agentId": agent_id, "timeline": []}

    pending = governance.list_pending_incidents()
    timeline = [
        {"step": "Isolated affected records", "status": "done"},
        {"step": "Confirmed batch origin (source_supplier)", "status": "done"},
        {"step": "Checked downstream stage dependencies", "status": "done"},
        {"step": "Searched knowledge base for precedent", "status": "done"},
        {"step": "Scored confidence + risk via LLM", "status": "done"},
        {
            "step": "Awaiting human approval" if pending else "Remediation executed",
            "status": "active" if pending else "done",
        },
    ]
    return {"agentId": agent_id, "timeline": timeline}
