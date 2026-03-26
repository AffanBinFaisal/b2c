from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class NoteModel(BaseModel):
    """Note database model"""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    title: str
    content: str = ""
    ownerId: PyObjectId
    collectionIds: List[PyObjectId] = Field(default_factory=list)
    tagIds: List[PyObjectId] = Field(default_factory=list)
    isPinned: bool = False
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    createdBy: Optional[PyObjectId] = None
    updatedBy: Optional[PyObjectId] = None
    deletedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
