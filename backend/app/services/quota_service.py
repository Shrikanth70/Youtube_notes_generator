from sqlalchemy.orm import Session
from sqlalchemy import select, update
from datetime import datetime
from app.models.usage_quota import UsageQuota
from app.models.profile import Profile
from typing import Optional


class QuotaService:
    @staticmethod
    def get_user_quota(db: Session, user_id: str) -> UsageQuota:
        """
        Get or create a usage quota for a user.
        """
        quota = db.execute(select(UsageQuota).where(UsageQuota.user_id == user_id)).scalar_one_or_none()

        if quota is None:
            # Create a default quota based on the user's plan
            profile = db.execute(select(Profile).where(Profile.id == user_id)).scalar_one_or_none()

            # Defaults for free tier
            daily_limit = 5
            monthly_limit = 100

            if profile and profile.plan == "premium":
                daily_limit = 50
                monthly_limit = 1000

            quota = UsageQuota(
                user_id=user_id,
                daily_generation_limit=daily_limit,
                monthly_generation_limit=monthly_limit,
            )
            db.add(quota)
            db.commit()
            db.refresh(quota)

        # Check for resets
        QuotaService._check_and_reset_quotas(db, quota)

        return quota

    @staticmethod
    def _check_and_reset_quotas(db: Session, quota: UsageQuota):
        """
        Internal method to reset counters based on date.
        """
        now = datetime.now()
        updated = False

        # Reset daily if last reset was a different day
        if quota.last_daily_reset_at.date() < now.date():
            quota.daily_generation_count = 0
            quota.last_daily_reset_at = now
            updated = True

        # Reset monthly if last reset was a different month
        if quota.last_monthly_reset_at.month < now.month or quota.last_monthly_reset_at.year < now.year:
            quota.monthly_generation_count = 0
            quota.last_monthly_reset_at = now
            updated = True

        if updated:
            db.commit()
            db.refresh(quota)

    @staticmethod
    def can_generate(db: Session, user_id: str) -> bool:
        """
        Check if the user has remaining quota for generation.
        Admins have unlimited usage.
        """
        profile = db.execute(select(Profile).where(Profile.id == user_id)).scalar_one_or_none()
        if profile and profile.role == "admin":
            return True

        quota = QuotaService.get_user_quota(db, user_id)
        return (
            quota.daily_generation_count < quota.daily_generation_limit and
            quota.monthly_generation_count < quota.monthly_generation_limit
        )

    @staticmethod
    def increment_usage(db: Session, user_id: str):
        """
        Increment the usage counters for a successful generation.
        """
        quota = QuotaService.get_user_quota(db, user_id)
        quota.daily_generation_count += 1
        quota.monthly_generation_count += 1
        db.commit()


    @staticmethod
    def update_quota(db: Session, user_id: str, daily_limit: int, monthly_limit: int) -> UsageQuota:
        """
        Update a user's usage limits.
        """
        quota = QuotaService.get_user_quota(db, user_id)
        quota.daily_generation_limit = daily_limit
        quota.monthly_generation_limit = monthly_limit
        db.commit()
        db.refresh(quota)
        return quota


quota_service = QuotaService()
