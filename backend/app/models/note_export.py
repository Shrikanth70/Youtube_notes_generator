from sqlalchemy import String, BigInteger, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class NoteExport(Base):
    __tablename__ = "note_exports"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    note_id: Mapped[str] = mapped_column(String, ForeignKey("notes.id", ondelete="CASCADE"), nullable=False)

    export_type: Mapped[str] = mapped_column(String, default="md", nullable=False)
    file_path: Mapped[str | None] = mapped_column(String, nullable=True)
    file_size_bytes: Mapped[int | None] = mapped_column(BigInteger, nullable=True)

    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
