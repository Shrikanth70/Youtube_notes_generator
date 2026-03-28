"""
utils.py
Helpers for:
1. Extracting YouTube video ID
2. Fetching transcript safely
3. Returning clean plain text
"""

import re
from youtube_transcript_api import YouTubeTranscriptApi


def extract_video_id(url: str) -> str:
    """
    Extract a YouTube video ID from common URL formats or accept a raw 11-char ID.
    """
    patterns = [
        r"(?:v=)([a-zA-Z0-9_-]{11})",
        r"(?:youtu\.be/)([a-zA-Z0-9_-]{11})",
        r"(?:shorts/)([a-zA-Z0-9_-]{11})",
        r"(?:embed/)([a-zA-Z0-9_-]{11})",
    ]

    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)

    if re.fullmatch(r"[a-zA-Z0-9_-]{11}", url):
        return url

    raise ValueError("Invalid YouTube URL or video ID.")


def get_transcript_text(video_id: str) -> str:
    """
    Fetch transcript text for a YouTube video ID using the newer API style.

    Raises:
        RuntimeError: If transcript is unavailable or parsing fails.
    """
    try:
        ytt_api = YouTubeTranscriptApi()

        # Try to list available transcripts first
        transcript_list = ytt_api.list(video_id)

        # Prefer English, then Indian English, then Hindi
        try:
            transcript = transcript_list.find_transcript(["en", "en-IN", "hi"])
        except Exception:
            # Fall back to translatable or generated transcript if needed
            transcript = next(iter(transcript_list))

        fetched = transcript.fetch()

        text = " ".join(
            snippet.text.strip()
            for snippet in fetched
            if getattr(snippet, "text", "").strip()
        )

        text = text.replace("\n", " ")
        text = re.sub(r"\s+", " ", text).strip()

        if not text:
            raise RuntimeError("Transcript was fetched but empty.")

        return text

    except Exception as e:
        raise RuntimeError(
            f"Failed to fetch transcript for video '{video_id}'. "
            f"This can happen if captions are unavailable, YouTube returned empty subtitle data, "
            f"or the request was blocked. Original error: {e}"
        )