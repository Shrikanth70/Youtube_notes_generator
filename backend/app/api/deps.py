from typing import Generator
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import get_current_user
from app.schemas.auth import TokenData
from app.models.profile import Profile
from sqlalchemy import select


def get_db() -> Generator:
    """
    FastAPI dependency to get a database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        try:
            db.close()
        except Exception:
            # If connection is already dead, closing might fail but shouldn't crash the server
            pass


async def get_current_active_user(
    db: Session = Depends(get_db),
    token_data: TokenData = Depends(get_current_user),
) -> Profile:
    """
    FastAPI dependency to get the current user from the database.
    """
    user = db.execute(select(Profile).where(Profile.id == token_data.user_id)).scalar_one_or_none()

    if not user:
        # If the user doesn't exist in the local profile table yet, create it
        # This can happen on first login after auth
        user = Profile(
            id=token_data.user_id,
            email=token_data.email,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if user.account_status != "active":
        raise HTTPException(status_code=400, detail="Inactive user")

    return user


async def get_current_admin_user(
    current_user: Profile = Depends(get_current_active_user),
) -> Profile:
    """
    FastAPI dependency to ensure the current user has administrative privileges.
    """
    if current_user.role != "admin" and current_user.email != "shrikanthbhukya03@gmail.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have enough privileges",
        )
    return current_user
