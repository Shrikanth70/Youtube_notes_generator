from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "AI YouTube Notes Generator API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    DATABASE_URL: str

    SUPABASE_URL: str
    SUPABASE_JWT_SECRET: str

    OPENROUTER_API_KEY: str | None = None
    OPENROUTER_MODELS: List[str] = ["nvidia/nemotron-3-super-120b-a12b:free", "qwen/qwen3.6-plus:free", "google/gemma-7b-it:free"]

    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:5175"

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"), 
        env_file_encoding="utf-8", 
        extra="ignore"
    )


settings = Settings()
