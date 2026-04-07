from sqlalchemy import String, Integer, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)

    youtube_url: Mapped[str] = mapped_column(Text, nullable=False)
    youtube_video_id: Mapped[str | None] = mapped_column(String, nullable=True)
    video_title: Mapped[str | None] = mapped_column(Text, nullable=True)
    video_channel: Mapped[str | None] = mapped_column(Text, nullable=True)
    video_duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    transcript_language: Mapped[str | None] = mapped_column(String, nullable=True)
    transcript_source: Mapped[str | None] = mapped_column(String, nullable=True)

    generated_title: Mapped[str | None] = mapped_column(Text, nullable=True)
    markdown_content: Mapped[str] = mapped_column(Text, nullable=False)
    plain_text_content: Mapped[str | None] = mapped_column(Text, nullable=True)

    style: Mapped[str] = mapped_column(String, default="standard", nullable=False)
    status: Mapped[str] = mapped_column(String, default="completed", nullable=False)

    token_input: Mapped[int | None] = mapped_column(Integer, nullable=True)
    token_output: Mapped[int | None] = mapped_column(Integer, nullable=True)
    model_name: Mapped[str | None] = mapped_column(String, nullable=True)
    provider_name: Mapped[str | None] = mapped_column(String, nullable=True)

    summary_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
