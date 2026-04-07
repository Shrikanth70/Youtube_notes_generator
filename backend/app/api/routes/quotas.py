from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.profile import Profile
from app.schemas import usage_quota as quota_schema
from app.services.quota_service import quota_service


router = APIRouter()


@router.get("/me/", response_model=quota_schema.UsageQuota)
def read_quota(
    *,
    db: Session = Depends(deps.get_db),
    user: Profile = Depends(deps.get_current_active_user),
):
    """
    Get current user quota.
    """
    return quota_service.get_user_quota(db, user.id)
