"""Request body models for the incident decision endpoints. Response shapes are
plain dicts (see db_reader.py / mock_data.py) -- this MVP doesn't need strict
response schemas on top of what's already documented in README section 4/7.
"""
from typing import Optional

from pydantic import BaseModel


class ApproveRequest(BaseModel):
    approver: str = "dataops_lead"


class ModifyRequest(BaseModel):
    approver: str = "dataops_lead"
    modification_note: str


class RejectRequest(BaseModel):
    approver: str = "dataops_lead"


class EscalateRequest(BaseModel):
    approver: str = "dataops_lead"
    note: Optional[str] = None


class AskRequest(BaseModel):
    question: str
