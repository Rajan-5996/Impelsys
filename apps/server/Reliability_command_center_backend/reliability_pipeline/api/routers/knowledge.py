"""Knowledge & Policies (README section 7.4). Mock -- real external system
connectors (ServiceNow, Jira, runbook library) are out of scope for this build."""
from fastapi import APIRouter, HTTPException

from ..mock_data import KNOWLEDGE_BASE_ARTICLES, KNOWLEDGE_SOURCES, POLICIES

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])


@router.get("/sources")
def list_sources():
    return {"sources": KNOWLEDGE_SOURCES}


@router.get("/articles")
def list_articles():
    return {"articles": KNOWLEDGE_BASE_ARTICLES}


@router.get("/articles/{article_id}")
def get_article(article_id: str):
    match = next((a for a in KNOWLEDGE_BASE_ARTICLES if a["id"] == article_id), None)
    if match is None:
        raise HTTPException(status_code=404, detail=f"No article found with id {article_id!r}")
    return match


@router.get("/policies")
def list_policies():
    return {"policies": POLICIES}


@router.get("/policies/{policy_id}")
def get_policy(policy_id: str):
    match = next((p for p in POLICIES if p["id"] == policy_id), None)
    if match is None:
        raise HTTPException(status_code=404, detail=f"No policy found with id {policy_id!r}")
    return match
