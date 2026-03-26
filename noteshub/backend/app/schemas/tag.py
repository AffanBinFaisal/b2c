from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator
import re


class TagCreate(BaseModel):
    """Tag creation schema"""
    name: str

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        v = v.lower()  # Case-insensitive
        if len(v) < 1 or len(v) > 50:
            raise ValueError('Tag name must be between 1 and 50 characters')
        if not re.match(r'^[a-z0-9\-]+$', v):
            raise ValueError('Tag name can only contain lowercase letters, numbers, and hyphens')
        return v


class TagResponse(BaseModel):
    """Tag response schema"""
    id: str = Field(alias="_id")
    name: str
    type: Literal["predefined", "custom"]
    ownerId: Optional[str] = None
    usageCount: int = 0
    createdAt: datetime

    class Config:
        populate_by_name = True
