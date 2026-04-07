from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None


class User(UserBase):
    id: str
    role: str = "user"

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: str
    email: Optional[str] = None
    role: str = "user"
