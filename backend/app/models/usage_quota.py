from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.core.database import Base


class UsageQuota(Base):
    __tablename__ = "usage_quotas"

    user_id: Mapped[str] = mapped_column(String, ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True)

    daily_generation_limit: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    monthly_generation_limit: Mapped[int] = mapped_column(Integer, default=100, nullable=False)

    daily_generation_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    monthly_generation_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    last_daily_reset_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_monthly_reset_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
