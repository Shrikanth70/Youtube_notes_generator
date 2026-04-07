from typing import Optional
from pydantic import BaseModel, HttpUrl
from datetime import datetime
from uuid import UUID


class NoteBase(BaseModel):
    youtube_url: str
    youtube_video_id: Optional[str] = None
    video_title: Optional[str] = None
    thumbnail_url: Optional[str] = None
    style: str = "standard"


class NoteCreate(NoteBase):
    markdown_content: str
    user_id: UUID


class NoteUpdate(BaseModel):
    video_title: Optional[str] = None
    markdown_content: Optional[str] = None
    is_favorite: Optional[bool] = None
    is_archived: Optional[bool] = None


class Note(NoteBase):
    id: UUID
    user_id: UUID
    video_channel: Optional[str] = None
    video_duration_seconds: Optional[int] = None
    generated_title: Optional[str] = None
    markdown_content: str
    status: str
    is_favorite: bool
    is_archived: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
