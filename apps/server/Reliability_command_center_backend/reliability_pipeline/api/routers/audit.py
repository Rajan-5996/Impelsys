"""Audit & Governance: the real, queryable audit_log trail (README section 7.5)."""
from typing import Optional

from fastapi import APIRouter, Query

from .. import db_reader

router = APIRouter(prefix="/api/audit-log", tags=["audit"])


@router.get("")
def get_audit_log(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    incident_id: Optional[str] = None,
    action: Optional[str] = None,
):
    return db_reader.get_audit_log(limit=limit, offset=offset, incident_id=incident_id, action=action)
