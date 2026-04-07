from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.api.deps import get_db, get_current_active_user
from app.models.profile import Profile
from app.models.note_job import NoteJob
from app.schemas.note_job import NoteJob as NoteJobResponse

router = APIRouter(tags=["Jobs"])


@router.get("/", response_model=list[NoteJobResponse])
async def list_my_jobs(
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_active_user),
):
    """
    Retrieve one or more background jobs for the user.
    """
    query = select(NoteJob).where(NoteJob.user_id == current_user.id).order_by(NoteJob.created_at.desc())
    jobs = db.execute(query).scalars().all()
    return jobs


@router.get("/{job_id}", response_model=NoteJobResponse)
async def get_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_active_user),
):
    """
    Retrieve a specific background job by ID.
    """
    query = select(NoteJob).where(NoteJob.id == job_id, NoteJob.user_id == current_user.id)
    job = db.execute(query).scalar_one_or_none()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Job configuration not found for the current identity."
        )
    return job
