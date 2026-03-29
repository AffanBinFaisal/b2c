from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


class NoteCreate(BaseModel):
    """Note creation schema"""
    title: str
    content: str = ""
    collectionIds: List[str]
    tagIds: List[str] = Field(default_factory=list)
    isPinned: bool = False

    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        if len(v) < 1 or len(v) > 200:
            raise ValueError('Title must be between 1 and 200 characters')
        return v

    @field_validator('content')
    @classmethod
    def validate_content(cls, v):
        if len(v) > 50000:
            raise ValueError('Content must not exceed 50,000 characters')
        return v

    @field_validator('collectionIds')
    @classmethod
    def validate_collections(cls, v):
        if len(v) < 1:
            raise ValueError('Note must belong to at least one collection')
        return v

    @field_validator('tagIds')
    @classmethod
    def validate_tags(cls, v):
        if len(v) > 20:
            raise ValueError('Note cannot have more than 20 tags')
        return v


class NoteUpdate(BaseModel):
    """Note update schema"""
    title: Optional[str] = None
    content: Optional[str] = None
    collectionIds: Optional[List[str]] = None
    tagIds: Optional[List[str]] = None
    isPinned: Optional[bool] = None

    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        if v is not None and (len(v) < 1 or len(v) > 200):
            raise ValueError('Title must be between 1 and 200 characters')
        return v

    @field_validator('content')
    @classmethod
    def validate_content(cls, v):
        if v is not None and len(v) > 50000:
            raise ValueError('Content must not exceed 50,000 characters')
        return v

    @field_validator('collectionIds')
    @classmethod
    def validate_collections(cls, v):
        if v is not None and len(v) < 1:
            raise ValueError('Note must belong to at least one collection')
        return v

    @field_validator('tagIds')
    @classmethod
    def validate_tags(cls, v):
        if v is not None and len(v) > 20:
            raise ValueError('Note cannot have more than 20 tags')
        return v


class NoteResponse(BaseModel):
    """Note response schema"""
    id: str = Field(alias="_id")
    title: str
    content: str
    ownerId: str
    collectionIds: List[str]
    tagIds: List[str]
    isPinned: bool
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True


class NoteListResponse(BaseModel):
    """Note list response with preview"""
    id: str = Field(alias="_id")
    title: str
    contentPreview: str
    ownerId: str
    collectionIds: List[str]
    tagIds: List[str]
    isPinned: bool
    updatedAt: datetime

    class Config:
        populate_by_name = True


class NoteListPaginatedResponse(BaseModel):
    """Paginated note list (20 per page per PRD)."""
    items: List[NoteListResponse]
    total: int


class NoteTrashItem(BaseModel):
    """Soft-deleted note in trash (recoverable within retention window)."""
    id: str = Field(alias="_id")
    title: str
    contentPreview: str
    ownerId: str
    collectionIds: List[str]
    tagIds: List[str]
    isPinned: bool
    updatedAt: datetime
    deletedAt: datetime

    class Config:
        populate_by_name = True


class NoteTrashListResponse(BaseModel):
    items: List[NoteTrashItem]
    total: int
