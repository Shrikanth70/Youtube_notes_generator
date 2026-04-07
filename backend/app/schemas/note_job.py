from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class NoteJobBase(BaseModel):
    youtube_url: str
    requested_style: str = "standard"


class NoteJobCreate(NoteJobBase):
    pass


class NoteJob(NoteJobBase):
    id: UUID
    user_id: UUID
    job_type: str
    status: str
    youtube_video_id: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    note_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
