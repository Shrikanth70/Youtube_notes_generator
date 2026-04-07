from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.profile import Profile
from app.schemas import profile as profile_schema


router = APIRouter()


@router.get("/me", response_model=profile_schema.Profile)
def read_user_me(
    user: Profile = Depends(deps.get_current_active_user),
):
    """
    Get current user profile.
    """
    return user


@router.patch("/me", response_model=profile_schema.Profile)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user: Profile = Depends(deps.get_current_active_user),
    user_in: profile_schema.ProfileUpdate,
):
    """
    Update current user profile.
    """
    update_data = user_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.add(user)
    db.commit()
    db.refresh(user)
    return user
