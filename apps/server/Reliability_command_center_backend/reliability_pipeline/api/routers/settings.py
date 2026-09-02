"""Settings (README section 7.6). Static config -- real auth/multi-tenancy/RBAC
is explicitly out of scope for this build."""
from fastapi import APIRouter

from ..mock_data import SETTINGS

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("")
def get_settings():
    return SETTINGS
