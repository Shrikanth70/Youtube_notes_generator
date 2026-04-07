from fastapi import APIRouter
from app.api.routes import notes, profile, quotas, admin, jobs, exports


api_router = APIRouter()
api_router.include_router(notes.router, prefix="/notes", tags=["notes"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(quotas.router, prefix="/quotas", tags=["quotas"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(exports.router, prefix="/exports", tags=["exports"])
