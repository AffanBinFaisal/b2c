from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

# Always load backend/.env (not cwd-relative), so uvicorn works from any folder.
_BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Application settings"""
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "noteshub"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days
    FRONTEND_URL: str = "http://localhost:5173"
    ENVIRONMENT: str = "development"

    # If True, new accounts are verified immediately (no email). Use only on trusted local/dev setups.
    AUTO_VERIFY_EMAIL: bool = False

    # Optional SMTP (password reset & email verification).
    # Set SMTP_HOST and SMTP_FROM to enable real delivery; otherwise emails are only logged.
    # Port 587: SMTP_USE_TLS=true, SMTP_USE_SSL=false (STARTTLS).
    # Port 465: SMTP_USE_SSL=true, SMTP_USE_TLS=false (implicit TLS).
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: Optional[str] = None
    SMTP_USE_TLS: bool = True
    SMTP_USE_SSL: bool = False

    # Soft-delete retention (PRD: 30 days)
    SOFT_DELETE_RETENTION_DAYS: int = 30

    # Search (PRD)
    SEARCH_TIMEOUT_SECONDS: float = 5.0
    SEARCH_MAX_TOTAL_RESULTS: int = 1000

    model_config = SettingsConfigDict(
        env_file=str(_BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


settings = Settings()
