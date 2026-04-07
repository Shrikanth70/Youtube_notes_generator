from sqlalchemy import String, Boolean, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.core.database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    full_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    email: Mapped[str | None] = mapped_column(String, unique=True, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    role: Mapped[str] = mapped_column(String, default="user", nullable=False)
    plan: Mapped[str] = mapped_column(String, default="free", nullable=False)
    account_status: Mapped[str] = mapped_column(String, default="active", nullable=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    preferred_note_style: Mapped[str] = mapped_column(String, default="standard", nullable=False)
    preferred_language: Mapped[str] = mapped_column(String, default="en", nullable=False)
    timezone: Mapped[str] = mapped_column(String, default="Asia/Kolkata", nullable=False)
    theme: Mapped[str] = mapped_column(String, default="system", nullable=False)

    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
