from typing import Optional, List, Literal
from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    """Search request schema"""
    query: str = ""
    collectionIds: List[str] = Field(default_factory=list)
    tagIds: List[str] = Field(default_factory=list)
    # Omit to use the authenticated user's preferences.searchLogic (PRD).
    logic: Optional[Literal["AND", "OR"]] = None
    sortBy: Literal["relevance", "updatedAt"] = "relevance"
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=20)


class SearchResponse(BaseModel):
    """Search response schema"""
    results: List[dict]
    total: int
    totalMatches: int
    page: int
    limit: int
    totalPages: int
