from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from app.database import get_database
from app.schemas.search import SearchRequest, SearchResponse
from app.utils.auth import get_current_user_id
from app.utils.helpers import object_id_list, str_id_list, create_content_preview
import asyncio

router = APIRouter(prefix="/search", tags=["Search"])


@router.post("", response_model=SearchResponse)
async def search_notes(
    search_data: SearchRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Search notes with full-text search and filters"""
    db = get_database()
    
    # Build base query
    query = {
        "ownerId": ObjectId(user_id),
        "deletedAt": None
    }
    
    # Add text search if query provided
    if search_data.query.strip():
        query["$text"] = {"$search": search_data.query}
    
    # Build filter conditions
    filter_conditions = []
    
    if search_data.collectionIds:
        try:
            collection_ids = object_id_list(search_data.collectionIds)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more collection IDs are invalid"
            )
        if search_data.logic == "AND":
            # Note must be in ALL specified collections
            query["collectionIds"] = {"$all": collection_ids}
        else:
            # Note must be in ANY of the specified collections
            filter_conditions.append({"collectionIds": {"$in": collection_ids}})
    
    if search_data.tagIds:
        try:
            tag_ids = object_id_list(search_data.tagIds)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more tag IDs are invalid"
            )
        if search_data.logic == "AND":
            # Note must have ALL specified tags
            query["tagIds"] = {"$all": tag_ids}
        else:
            # Note must have ANY of the specified tags
            filter_conditions.append({"tagIds": {"$in": tag_ids}})
    
    # Apply OR logic if needed
    if filter_conditions and search_data.logic == "OR":
        if len(filter_conditions) > 1:
            query["$or"] = filter_conditions
        else:
            query.update(filter_conditions[0])
    
    # Calculate pagination
    skip = (search_data.page - 1) * search_data.limit
    
    # Build sort criteria
    if search_data.sortBy == "relevance" and search_data.query.strip():
        # Sort by text score (relevance) when searching
        sort_criteria = [("score", {"$meta": "textScore"}), ("updatedAt", -1)]
        projection = {"score": {"$meta": "textScore"}}
    else:
        # Sort by updated date
        sort_criteria = [("isPinned", -1), ("updatedAt", -1)]
        projection = None
    
    try:
        # Execute search with timeout
        if projection:
            cursor = db.notes.find(query, projection)
        else:
            cursor = db.notes.find(query)
        
        # Apply sorting
        for field, direction in sort_criteria:
            cursor = cursor.sort(field, direction)
        
        # Get total count and results
        total = await db.notes.count_documents(query)
        notes = await cursor.skip(skip).limit(search_data.limit).to_list(length=search_data.limit)
        
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Search operation failed"
        )
    
    # Format results
    results = []
    for note in notes:
        results.append({
            "_id": str(note["_id"]),
            "title": note["title"],
            "contentPreview": create_content_preview(note["content"]),
            "ownerId": str(note["ownerId"]),
            "collectionIds": str_id_list(note["collectionIds"]),
            "tagIds": str_id_list(note["tagIds"]),
            "isPinned": note["isPinned"],
            "updatedAt": note["updatedAt"].isoformat(),
            "relevanceScore": note.get("score", 0) if projection else 0
        })
    
    # Calculate total pages
    total_pages = (total + search_data.limit - 1) // search_data.limit
    
    return {
        "results": results,
        "total": total,
        "page": search_data.page,
        "limit": search_data.limit,
        "totalPages": total_pages
    }
