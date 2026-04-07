from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class UsageQuotaBase(BaseModel):
    daily_generation_limit: int = 5
    monthly_generation_limit: int = 100
    daily_generation_count: int = 0
    monthly_generation_count: int = 0


class UsageQuotaUpdate(BaseModel):
    daily_generation_limit: int
    monthly_generation_limit: int


class UsageQuota(UsageQuotaBase):
    user_id: UUID
    last_daily_reset_at: datetime
    last_monthly_reset_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
