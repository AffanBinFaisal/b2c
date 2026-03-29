import hashlib
import secrets

from app.config import settings


def generate_raw_token() -> str:
    return secrets.token_urlsafe(32)


def hash_token(raw: str) -> str:
    return hashlib.sha256(f"{raw}:{settings.SECRET_KEY}".encode()).hexdigest()
