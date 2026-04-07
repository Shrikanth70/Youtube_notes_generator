from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID


class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    preferred_note_style: str = "standard"
    preferred_language: str = "en"
    timezone: str = "Asia/Kolkata"
    theme: str = "system"


class ProfileUpdate(ProfileBase):
    pass


class Profile(ProfileBase):
    id: UUID
    email: Optional[EmailStr] = None
    role: str
    plan: str
    account_status: str
    email_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
