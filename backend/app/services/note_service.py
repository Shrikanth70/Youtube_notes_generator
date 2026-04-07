from sqlalchemy.orm import Session
from crewai import Agent, Task, Crew
from app.core.config import settings
from app.services.youtube_service import youtube_service
from app.models.note import Note
from app.models.note_job import NoteJob
from app.services.quota_service import quota_service
import os
import datetime
import time


class NoteService:
    @staticmethod
    def generate_notes_task(
        user_id: str, youtube_url: str, job_id: str, style: str = "standard"
    ):
        """
        Main note generation logic.
        Uses only the single model configured in .env.
        Updates job status safely and avoids crashing background tasks.
        """
        from app.core.database import SessionLocal

        db = SessionLocal()
        try:
            job = db.get(NoteJob, job_id)
            if not job:
                print(f"⚠️ Job not found: {job_id}")
                return

            job.status = "running"
            job.started_at = datetime.datetime.now(datetime.timezone.utc)
            db.commit()
        except Exception as e:
            print(f"⚠️ Failed to mark job as running: {repr(e)}")
        finally:
            db.close()

        try:
            # 1. Extract Video ID & Fetch Transcript
            video_id = youtube_service.extract_video_id(youtube_url)
            transcript_text = youtube_service.get_transcript(video_id)
            if not transcript_text:
                raise ValueError("Transcript is empty or unavailable.")

            # 2. Define LLM Strategy (Fallback Chain)
            models_to_try = [
                f"openrouter/{model}" for model in settings.OPENROUTER_MODELS
            ]

            # Ensure OpenRouter API Key is in environment for LiteLLM
            if settings.OPENROUTER_API_KEY:
                os.environ["OPENROUTER_API_KEY"] = settings.OPENROUTER_API_KEY.strip()

            # 3. Direct generation with first free model
            last_error = ""
            final_notes = ""
            actual_model_used = "Unknown"

            current_model = models_to_try[0]
            print(f"🚀 [STARTING] AI Note Generation")

            notes_agent = Agent(
                role="Precise AI Content Generator & Translator",
                goal=f"Translate and summarize YouTube content into high-quality, {style} markdown notes using safe, simple English.",
                backstory="Expert AI content editor specialized in clear English translation and simplified educational summaries.",
                llm=current_model,
                verbose=False,
                allow_delegation=False,
            )

            safe_transcript = transcript_text[:30000]

            prompt = f"""
Generate comprehensive, detailed markdown notes from the following YouTube transcript.

REQUIRED STRUCTURE:
- Start with a main title based on the video content
- Use numbered sections with emoji markers (1️⃣, 2️⃣, 3️⃣, etc.)
- Each major section should have a descriptive heading with emoji
- Use subsections with different emoji (🔬, 😱, 🧠, 💻, 🔄, 💰, 📦, 📺, etc.)
- Include bullet points, numbered lists, and short explanatory paragraphs
- For feature comparisons, use markdown tables with columns like: #, Feature, What It Does, Offline?, Notes
- End with a closing section if appropriate

STYLING RULES:
- Create only clean markdown notes
- No image links or image placeholders
- No unnecessary verbosity
- Keep the notes beginner-friendly but informative
- Use clear headings (##, ###), subheadings, bullet points, and short explanatory sections
- Rewrite unclear spoken language into proper readable English
- Focus on clarity, structure, and usefulness
- If the transcript contains technical concepts, explain them simply
- Do not add unrelated content
- Do not mention these instructions
- Preserve the educational and detailed nature of the content

IMPORTANT: Generate a complete, well-structured markdown document that captures all the key information from the transcript in an easy-to-read format.

Transcript:
{safe_transcript}
"""

            notes_task = Task(
                description=prompt,
                expected_output="Structured markdown notes from the transcript.",
                agent=notes_agent,
            )

            crew = Crew(agents=[notes_agent], tasks=[notes_task], verbose=False)

            result = crew.kickoff()
            final_notes = str(result)
            actual_model_used = current_model
            print(f"✅ [SUCCESS] Notes generated successfully")

            # 4. Save Results (Pulse session)
            db = SessionLocal()
            try:
                saved_model_name = actual_model_used.split("/")[-1]
                new_note = Note(
                    user_id=user_id,
                    youtube_url=youtube_url,
                    youtube_video_id=video_id,
                    markdown_content=final_notes,
                    style=style,
                    status="completed",
                    model_name=saved_model_name,
                    provider_name="AI_GENERATED",
                )
                db.add(new_note)

                job = db.get(NoteJob, job_id)
                if job:
                    job.status = "completed"
                    job.completed_at = datetime.datetime.now(datetime.timezone.utc)
                    job.note_id = new_note.id

                quota_service.increment_usage(db, user_id)
                db.commit()
                db.refresh(new_note)
                return new_note
            finally:
                db.close()

        except Exception as e:
            # 5. Final error handling (Isolated Pulse session)
            error_msg = str(e)
            print(f"❌ [CRITICAL ERROR] Note generation failed: {error_msg}")

            db = SessionLocal()
            try:
                job = db.get(NoteJob, job_id)
                if job:
                    job.status = "failed"
                    job.error_message = error_msg
                    job.completed_at = datetime.datetime.now(datetime.timezone.utc)
                    db.commit()
            except Exception as final_e:
                print(f"Failed to record error in DB: {repr(final_e)}")
            finally:
                try:
                    db.close()
                except:
                    pass
            # Do not re-raise to prevent background task crash
            print("Background task completed with failure, job status updated.")


note_service = NoteService()
