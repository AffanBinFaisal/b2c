from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query
from bson import ObjectId
from app.database import get_database
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse, NoteListResponse
from app.utils.auth import get_current_user_id
from app.utils.helpers import object_id_list, str_id_list, create_content_preview

router = APIRouter(prefix="/notes", tags=["Notes"])


@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_data: NoteCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new note"""
    db = get_database()
    
    # Validate collections exist and belong to user
    try:
        collection_ids = object_id_list(note_data.collectionIds)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more collection IDs are invalid"
        )
    collections_count = await db.collections.count_documents({
        "_id": {"$in": collection_ids},
        "ownerId": ObjectId(user_id)
    })
    
    if collections_count != len(collection_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more collections not found or don't belong to you"
        )
    
    # Validate tags exist
    try:
        tag_ids = object_id_list(note_data.tagIds)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more tag IDs are invalid"
        )
    if tag_ids:
        tags_count = await db.tags.count_documents({
            "_id": {"$in": tag_ids},
            "$or": [
                {"type": "predefined"},
                {"ownerId": ObjectId(user_id)}
            ]
        })
        
        if tags_count != len(tag_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more tags not found or don't belong to you"
            )
    
    # Check user note limit (1000 notes per user)
    user_notes_count = await db.notes.count_documents({
        "ownerId": ObjectId(user_id),
        "deletedAt": None
    })
    
    if user_notes_count >= 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Note limit reached (1000 notes per user)"
        )
    
    # Create note
    note_dict = {
        "title": note_data.title,
        "content": note_data.content,
        "ownerId": ObjectId(user_id),
        "collectionIds": collection_ids,
        "tagIds": tag_ids,
        "isPinned": note_data.isPinned,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "createdBy": ObjectId(user_id),
        "updatedBy": ObjectId(user_id),
        "deletedAt": None
    }
    
    result = await db.notes.insert_one(note_dict)
    note_dict["_id"] = result.inserted_id
    
    return {
        "_id": str(note_dict["_id"]),
        "title": note_dict["title"],
        "content": note_dict["content"],
        "ownerId": str(note_dict["ownerId"]),
        "collectionIds": str_id_list(note_dict["collectionIds"]),
        "tagIds": str_id_list(note_dict["tagIds"]),
        "isPinned": note_dict["isPinned"],
        "createdAt": note_dict["createdAt"],
        "updatedAt": note_dict["updatedAt"]
    }


@router.get("", response_model=List[NoteListResponse])
async def get_notes(
    collection_id: Optional[str] = Query(None),
    tag_id: Optional[str] = Query(None),
    pinned_only: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user_id)
):
    """Get notes for current user with optional filters"""
    db = get_database()
    
    # Build query
    query = {
        "ownerId": ObjectId(user_id),
        "deletedAt": None
    }
    
    if collection_id:
        if not ObjectId.is_valid(collection_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid collection ID"
            )
        query["collectionIds"] = ObjectId(collection_id)
    
    if tag_id:
        if not ObjectId.is_valid(tag_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid tag ID"
            )
        query["tagIds"] = ObjectId(tag_id)
    
    if pinned_only:
        query["isPinned"] = True
    
    # Get notes sorted by pinned status and updated date
    notes = await db.notes.find(query).sort([
        ("isPinned", -1),
        ("updatedAt", -1)
    ]).skip(skip).limit(limit).to_list(length=limit)
    
    result = []
    for note in notes:
        result.append({
            "_id": str(note["_id"]),
            "title": note["title"],
            "contentPreview": create_content_preview(note["content"]),
            "ownerId": str(note["ownerId"]),
            "collectionIds": str_id_list(note["collectionIds"]),
            "tagIds": str_id_list(note["tagIds"]),
            "isPinned": note["isPinned"],
            "updatedAt": note["updatedAt"]
        })
    
    return result


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific note"""
    db = get_database()
    
    if not ObjectId.is_valid(note_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid note ID"
        )
    
    note = await db.notes.find_one({
        "_id": ObjectId(note_id),
        "ownerId": ObjectId(user_id),
        "deletedAt": None
    })
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    return {
        "_id": str(note["_id"]),
        "title": note["title"],
        "content": note["content"],
        "ownerId": str(note["ownerId"]),
        "collectionIds": str_id_list(note["collectionIds"]),
        "tagIds": str_id_list(note["tagIds"]),
        "isPinned": note["isPinned"],
        "createdAt": note["createdAt"],
        "updatedAt": note["updatedAt"]
    }


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: str,
    note_data: NoteUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update a note"""
    db = get_database()
    
    if not ObjectId.is_valid(note_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid note ID"
        )
    
    # Check if note exists and belongs to user
    note = await db.notes.find_one({
        "_id": ObjectId(note_id),
        "ownerId": ObjectId(user_id),
        "deletedAt": None
    })
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Build update data
    update_data = {"updatedAt": datetime.utcnow(), "updatedBy": ObjectId(user_id)}
    
    if note_data.title is not None:
        update_data["title"] = note_data.title
    
    if note_data.content is not None:
        update_data["content"] = note_data.content
    
    if note_data.isPinned is not None:
        update_data["isPinned"] = note_data.isPinned
    
    if note_data.collectionIds is not None:
        try:
            collection_ids = object_id_list(note_data.collectionIds)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more collection IDs are invalid"
            )
        collections_count = await db.collections.count_documents({
            "_id": {"$in": collection_ids},
            "ownerId": ObjectId(user_id)
        })
        
        if collections_count != len(collection_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more collections not found or don't belong to you"
            )
        
        update_data["collectionIds"] = collection_ids
    
    if note_data.tagIds is not None:
        try:
            tag_ids = object_id_list(note_data.tagIds)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more tag IDs are invalid"
            )
        if tag_ids:
            tags_count = await db.tags.count_documents({
                "_id": {"$in": tag_ids},
                "$or": [
                    {"type": "predefined"},
                    {"ownerId": ObjectId(user_id)}
                ]
            })
            
            if tags_count != len(tag_ids):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="One or more tags not found or don't belong to you"
                )
        
        update_data["tagIds"] = tag_ids
    
    # Update note
    await db.notes.update_one(
        {"_id": ObjectId(note_id)},
        {"$set": update_data}
    )
    
    # Get updated note
    updated_note = await db.notes.find_one({"_id": ObjectId(note_id)})
    
    return {
        "_id": str(updated_note["_id"]),
        "title": updated_note["title"],
        "content": updated_note["content"],
        "ownerId": str(updated_note["ownerId"]),
        "collectionIds": str_id_list(updated_note["collectionIds"]),
        "tagIds": str_id_list(updated_note["tagIds"]),
        "isPinned": updated_note["isPinned"],
        "createdAt": updated_note["createdAt"],
        "updatedAt": updated_note["updatedAt"]
    }


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Soft delete a note (30-day recovery period)"""
    db = get_database()
    
    if not ObjectId.is_valid(note_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid note ID"
        )
    
    # Check if note exists and belongs to user
    note = await db.notes.find_one({
        "_id": ObjectId(note_id),
        "ownerId": ObjectId(user_id),
        "deletedAt": None
    })
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Soft delete
    await db.notes.update_one(
        {"_id": ObjectId(note_id)},
        {
            "$set": {
                "deletedAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    return None


@router.post("/{note_id}/pin", response_model=NoteResponse)
async def pin_note(
    note_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Pin a note"""
    db = get_database()
    
    if not ObjectId.is_valid(note_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid note ID"
        )
    
    note = await db.notes.find_one({
        "_id": ObjectId(note_id),
        "ownerId": ObjectId(user_id),
        "deletedAt": None
    })
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    await db.notes.update_one(
        {"_id": ObjectId(note_id)},
        {
            "$set": {
                "isPinned": True,
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    updated_note = await db.notes.find_one({"_id": ObjectId(note_id)})
    
    return {
        "_id": str(updated_note["_id"]),
        "title": updated_note["title"],
        "content": updated_note["content"],
        "ownerId": str(updated_note["ownerId"]),
        "collectionIds": str_id_list(updated_note["collectionIds"]),
        "tagIds": str_id_list(updated_note["tagIds"]),
        "isPinned": updated_note["isPinned"],
        "createdAt": updated_note["createdAt"],
        "updatedAt": updated_note["updatedAt"]
    }


@router.post("/{note_id}/unpin", response_model=NoteResponse)
async def unpin_note(
    note_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Unpin a note"""
    db = get_database()
    
    if not ObjectId.is_valid(note_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid note ID"
        )
    
    note = await db.notes.find_one({
        "_id": ObjectId(note_id),
        "ownerId": ObjectId(user_id),
        "deletedAt": None
    })
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    await db.notes.update_one(
        {"_id": ObjectId(note_id)},
        {
            "$set": {
                "isPinned": False,
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    updated_note = await db.notes.find_one({"_id": ObjectId(note_id)})
    
    return {
        "_id": str(updated_note["_id"]),
        "title": updated_note["title"],
        "content": updated_note["content"],
        "ownerId": str(updated_note["ownerId"]),
        "collectionIds": str_id_list(updated_note["collectionIds"]),
        "tagIds": str_id_list(updated_note["tagIds"]),
        "isPinned": updated_note["isPinned"],
        "createdAt": updated_note["createdAt"],
        "updatedAt": updated_note["updatedAt"]
    }
