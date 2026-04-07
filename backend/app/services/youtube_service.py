import re
import httpx
from typing import Optional, Dict, Any
from youtube_transcript_api import YouTubeTranscriptApi


class YouTubeService:
    @staticmethod
    def extract_video_id(url: str) -> str:
        """
        Extract a YouTube video ID from common URL formats or accept a raw 11-char ID.
        """
        if not url:
            raise ValueError("No URL provided.")

        patterns = [
            r"(?:v=)([a-zA-Z0-9_-]{11})",
            r"(?:youtu\.be/)([a-zA-Z0-9_-]{11})",
            r"(?:shorts/)([a-zA-Z0-9_-]{11})",
            r"(?:embed/)([a-zA-Z0-9_-]{11})",
            r"(?:live/)([a-zA-Z0-9_-]{11})",
            r"(?:/v/)([a-zA-Z0-9_-]{11})",
            r"(?:vi/)([a-zA-Z0-9_-]{11})",
            r"(?:attribution_link.*v%3D)([a-zA-Z0-9_-]{11})",
        ]

        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)

        # Handle direct ID or simple watch URL without v= (unlikely but safe)
        if re.fullmatch(r"[a-zA-Z0-9_-]{11}", url):
            return url

        raise ValueError(f"Invalid YouTube URL or video ID: {url}")

    @staticmethod
    async def get_video_metadata(video_id: str) -> Dict[str, Any]:
        """
        Fetch basic video metadata using OEmbed (no API key required).
        """
        try:
            url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "title": data.get("title"),
                        "author_name": data.get("author_name"),
                        "thumbnail_url": data.get("thumbnail_url"),
                    }
        except Exception:
            pass

        return {
            "title": f"YouTube Video ({video_id})",
            "author_name": "Unknown Channel",
            "thumbnail_url": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
        }

    @staticmethod
    def get_transcript(video_id: str) -> str:
        """
        Fetch transcript text for a YouTube video ID.
        """
        try:
            fetched = None
            
            # Layer 1: Try the most standard static method
            try:
                print(f"[TRANSCRIPT] Trying static get_transcript for {video_id}")
                fetched = YouTubeTranscriptApi.get_transcript(video_id)
            except (AttributeError, TypeError):
                # Layer 2: Try instance-based call (required in some environments)
                try:
                    print(f"[TRANSCRIPT] Trying instance get_transcript for {video_id}")
                    fetched = YouTubeTranscriptApi().get_transcript(video_id)
                except (AttributeError, TypeError):
                    # Layer 3: Try the newer 'list' API (instance-based)
                    try:
                        print(f"[TRANSCRIPT] Trying instance.list for {video_id}")
                        transcript_list = YouTubeTranscriptApi().list(video_id)
                        # Try finding common languages, or just pick the first one
                        try:
                            transcript = transcript_list.find_transcript(['en', 'en-IN', 'hi'])
                        except:
                            transcript = next(iter(transcript_list))
                        fetched = transcript.fetch()
                    except Exception as e:
                        print(f"[TRANSCRIPT] All library patterns failed: {str(e)}")
                        raise RuntimeError(f"Library attribute mismatch: {str(e)}")

            if not fetched:
                raise RuntimeError("Failed to retrieve transcript data via any known API pattern.")

            # Helper to extract text from different snippet formats (dict or object)
            def extract_text(s):
                if isinstance(s, dict):
                    return s.get("text", "").strip()
                return getattr(s, "text", "").strip()

            text = " ".join(
                extract_text(snippet)
                for snippet in fetched
                if extract_text(snippet)
            )

            text = text.replace("\n", " ")
            text = re.sub(r"\s+", " ", text).strip()

            if not text:
                raise RuntimeError("Transcript was fetched but empty.")

            return text

        except Exception as e:
            raise RuntimeError(
                f"Failed to fetch transcript: {str(e)}"
            )


youtube_service = YouTubeService()
