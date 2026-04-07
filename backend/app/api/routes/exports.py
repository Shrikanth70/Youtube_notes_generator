from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.profile import Profile
from app.models.note import Note
from app.models.note_export import NoteExport
from app.services.export_service import export_service
import io

router = APIRouter(tags=["Exports"])


@router.get("/{note_id}/md")
def export_note_markdown(
    note_id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    file_buffer = export_service.generate_markdown(note.video_title or "Note", note.markdown_content)
    
    # Record export
    new_export = NoteExport(
        user_id=current_user.id,
        note_id=note.id,
        export_type="md",
        file_size_bytes=file_buffer.getbuffer().nbytes
    )
    db.add(new_export)
    db.commit()

    filename = f"{note.video_title or 'note'}.md".replace(" ", "_")
    return StreamingResponse(
        file_buffer,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/{note_id}/pdf")
def export_note_pdf(
    note_id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    file_buffer = export_service.generate_pdf(note.video_title or "Note", note.markdown_content)
    
    # Record export
    new_export = NoteExport(
        user_id=current_user.id,
        note_id=note.id,
        export_type="pdf",
        file_size_bytes=file_buffer.getbuffer().nbytes
    )
    db.add(new_export)
    db.commit()

    filename = f"{note.video_title or 'note'}.pdf".replace(" ", "_")
    return StreamingResponse(
        file_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
