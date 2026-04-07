from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete
from pydantic import BaseModel

from app.api import deps
from app.models.profile import Profile
from app.schemas.profile import Profile as ProfileSchema
from app.schemas.usage_quota import UsageQuota as UsageQuotaSchema, UsageQuotaUpdate
from app.services.quota_service import quota_service

router = APIRouter()

class UserUpdate(BaseModel):
    role: Optional[str] = None
    account_status: Optional[str] = None
    plan: Optional[str] = None

@router.get("/users", response_model=List[ProfileSchema])
def read_users(
    db: Session = Depends(deps.get_db),
    current_user: Profile = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Retrieve users (Admin only).
    """
    users = db.execute(select(Profile)).scalars().all()
    return users

@router.patch("/users/{user_id}", response_model=ProfileSchema)
def update_user(
    user_id: str,
    update_data: UserUpdate,
    db: Session = Depends(deps.get_db),
    current_user: Profile = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Update a user (Admin only).
    """
    query = select(Profile).where(Profile.id == user_id)
    user = db.execute(query).scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if update_data.role:
        user.role = update_data.role
    if update_data.account_status:
        user.account_status = update_data.account_status
    if update_data.plan:
        user.plan = update_data.plan
        
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    db: Session = Depends(deps.get_db),
    current_user: Profile = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Delete a user (Admin only).
    """
    if user_id == str(current_user.id):
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
        
    query = select(Profile).where(Profile.id == user_id)
    user = db.execute(query).scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.patch("/users/{user_id}/quota", response_model=UsageQuotaSchema)
def update_user_quota(
    user_id: str,
    update_data: UsageQuotaUpdate,
    db: Session = Depends(deps.get_db),
    current_user: Profile = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Update a user's generation quota (Admin only).
    """
    return quota_service.update_quota(
        db, 
        user_id, 
        update_data.daily_generation_limit, 
        update_data.monthly_generation_limit
    )
