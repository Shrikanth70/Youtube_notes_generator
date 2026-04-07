from sqlalchemy import String, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class NoteJob(Base):
    __tablename__ = "note_jobs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)

    job_type: Mapped[str] = mapped_column(String, default="generate_notes", nullable=False)
    status: Mapped[str] = mapped_column(String, default="pending", nullable=False)

    youtube_url: Mapped[str] = mapped_column(Text, nullable=False)
    youtube_video_id: Mapped[str | None] = mapped_column(String, nullable=True)
    requested_style: Mapped[str] = mapped_column(String, default="standard", nullable=False)

    started_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    backend_request_id: Mapped[str | None] = mapped_column(String, nullable=True)

    note_id: Mapped[str | None] = mapped_column(String, ForeignKey("notes.id", ondelete="SET NULL"), nullable=True)

    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
