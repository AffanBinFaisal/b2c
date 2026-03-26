from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "noteshub"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
