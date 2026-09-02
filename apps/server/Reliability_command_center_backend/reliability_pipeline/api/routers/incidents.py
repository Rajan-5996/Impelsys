"""Incident Workspace: the real SALES_DAILY_ETL / customer_validation_asset incident
(backed by governance.py + DuckDB) plus the two out-of-scope mock incidents
(NorthStar volume anomaly, GlobalFeeds missing feed) documented in README section 4.
"""
from fastapi import APIRouter, HTTPException

from ... import governance
from .. import db_reader
from ..mock_data import GLOBALFEEDS_ALERT, NORTHSTAR_INCIDENT
from ..schemas import ApproveRequest, EscalateRequest, ModifyRequest, RejectRequest

router = APIRouter(prefix="/api/incidents", tags=["incidents"])

MOCK_INCIDENTS = {NORTHSTAR_INCIDENT["id"]: NORTHSTAR_INCIDENT, GLOBALFEEDS_ALERT["id"]: GLOBALFEEDS_ALERT}


@router.get("")
def list_incidents():
    real = db_reader.list_etl_incidents()
    return {
        "real": real,
        "mock": [NORTHSTAR_INCIDENT, GLOBALFEEDS_ALERT],
    }


@router.get("/{incident_id}")
def get_incident(incident_id: str):
    if incident_id in MOCK_INCIDENTS:
        return MOCK_INCIDENTS[incident_id]

    detail = db_reader.get_etl_incident_detail(incident_id)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"No incident found with id {incident_id!r}")
    return detail


@router.post("/{incident_id}/approve")
def approve(incident_id: str, body: ApproveRequest):
    if incident_id in MOCK_INCIDENTS:
        raise HTTPException(status_code=400, detail="This incident is a mock fixture and has no real remediation to execute.")
    try:
        return governance.approve_incident(incident_id, approver=body.approver)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.post("/{incident_id}/modify")
def modify(incident_id: str, body: ModifyRequest):
    if incident_id in MOCK_INCIDENTS:
        raise HTTPException(status_code=400, detail="This incident is a mock fixture and has no real remediation to execute.")
    try:
        return governance.approve_incident(
            incident_id, approver=body.approver, modification_note=body.modification_note
        )
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.post("/{incident_id}/reject")
def reject(incident_id: str, body: RejectRequest):
    if incident_id in MOCK_INCIDENTS:
        raise HTTPException(status_code=400, detail="This incident is a mock fixture and has no real remediation to execute.")
    try:
        return governance.reject_incident(incident_id, approver=body.approver)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.post("/{incident_id}/escalate")
def escalate(incident_id: str, body: EscalateRequest):
    if incident_id in MOCK_INCIDENTS:
        raise HTTPException(status_code=400, detail="This incident is a mock fixture and has no real remediation to execute.")
    try:
        return governance.escalate_incident(incident_id, approver=body.approver, note=body.note)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
