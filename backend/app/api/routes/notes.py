from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.api import deps
from app.models.profile import Profile
from app.models.note import Note
from app.models.note_job import NoteJob
from app.schemas import note as note_schema
from app.schemas import note_job as job_schema
from app.services.quota_service import quota_service
from app.services.note_service import note_service
import uuid


router = APIRouter()


@router.post("/generate", response_model=job_schema.NoteJob)
def generate_note(
    *,
    db: Session = Depends(deps.get_db),
    user: Profile = Depends(deps.get_current_active_user),
    note_in: job_schema.NoteJobCreate,
    background_tasks: BackgroundTasks
):
    """
    Generate notes from a YouTube URL.
    """
    # 1. Check Quota
    if not quota_service.can_generate(db, user.id):
        raise HTTPException(
            status_code=403,
            detail="Usage quota exceeded. Please upgrade or wait for the reset.",
        )

    # 2. Create Job
    job = NoteJob(
        user_id=user.id,
        youtube_url=note_in.youtube_url,
        requested_style=note_in.requested_style,
        status="pending",
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # 3. Queue Generation Task
    background_tasks.add_task(
        note_service.generate_notes_task,
        user_id=user.id,
        youtube_url=note_in.youtube_url,
        job_id=job.id,
        style=note_in.requested_style
    )

    return job


@router.get("/", response_model=List[note_schema.Note])
def list_notes(
    db: Session = Depends(deps.get_db),
    user: Profile = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve user notes.
    """
    notes = db.execute(
        select(Note)
        .where(Note.user_id == user.id)
        .offset(skip)
        .limit(limit)
        .order_by(Note.created_at.desc())
    ).scalars().all()
    return notes


@router.get("/{note_id}", response_model=note_schema.Note)
def get_note(
    *,
    db: Session = Depends(deps.get_db),
    user: Profile = Depends(deps.get_current_active_user),
    note_id: str,
):
    """
    Get note by ID.
    """
    note = db.get(Note, note_id)
    if not note or note.user_id != user.id:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.patch("/{note_id}", response_model=note_schema.Note)
def update_note(
    *,
    db: Session = Depends(deps.get_db),
    user: Profile = Depends(deps.get_current_active_user),
    note_id: str,
    note_in: note_schema.NoteUpdate,
):
    """
    Update a note.
    """
    note = db.get(Note, note_id)
    if not note or note.user_id != user.id:
        raise HTTPException(status_code=404, detail="Note not found")

    update_data = note_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(note, field, value)

    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}")
def delete_note(
    *,
    db: Session = Depends(deps.get_db),
    user: Profile = Depends(deps.get_current_active_user),
    note_id: str,
):
    """
    Delete a note.
    """
    note = db.get(Note, note_id)
    if not note or note.user_id != user.id:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()
    return {"status": "ok"}
