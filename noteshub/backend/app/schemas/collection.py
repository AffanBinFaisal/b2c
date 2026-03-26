from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator
import re


class CollectionCreate(BaseModel):
    """Collection creation schema"""
    name: str

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if len(v) < 1 or len(v) > 100:
            raise ValueError('Collection name must be between 1 and 100 characters')
        if not re.match(r'^[a-zA-Z0-9\s\-_]+$', v):
            raise ValueError('Collection name can only contain letters, numbers, spaces, hyphens, and underscores')
        return v


class CollectionUpdate(BaseModel):
    """Collection update schema"""
    name: str

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if len(v) < 1 or len(v) > 100:
            raise ValueError('Collection name must be between 1 and 100 characters')
        if not re.match(r'^[a-zA-Z0-9\s\-_]+$', v):
            raise ValueError('Collection name can only contain letters, numbers, spaces, hyphens, and underscores')
        return v


class CollectionResponse(BaseModel):
    """Collection response schema"""
    id: str = Field(alias="_id")
    name: str
    ownerId: str
    createdAt: datetime
    updatedAt: datetime
    noteCount: int = 0

    class Config:
        populate_by_name = True
