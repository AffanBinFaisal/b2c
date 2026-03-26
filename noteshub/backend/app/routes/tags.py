from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from app.database import get_database
from app.schemas.tag import TagCreate, TagResponse
from app.utils.auth import get_current_user_id

router = APIRouter(prefix="/tags", tags=["Tags"])


@router.post("", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag_data: TagCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a custom tag"""
    db = get_database()
    
    # Normalize tag name (lowercase)
    tag_name = tag_data.name.lower()
    
    # Check if tag already exists (predefined or user's custom)
    existing = await db.tags.find_one({
        "name": tag_name,
        "$or": [
            {"type": "predefined"},
            {"ownerId": ObjectId(user_id)}
        ]
    })
    
    if existing:
        # Return existing tag
        usage_count = await db.notes.count_documents({
            "tagIds": existing["_id"],
            "deletedAt": None
        })
        
        return {
            "_id": str(existing["_id"]),
            "name": existing["name"],
            "type": existing["type"],
            "ownerId": str(existing["ownerId"]) if existing.get("ownerId") else None,
            "usageCount": usage_count,
            "createdAt": existing["createdAt"]
        }
    
    # Create new custom tag
    tag_dict = {
        "name": tag_name,
        "type": "custom",
        "ownerId": ObjectId(user_id),
        "createdAt": datetime.utcnow()
    }
    
    result = await db.tags.insert_one(tag_dict)
    tag_dict["_id"] = result.inserted_id
    
    return {
        "_id": str(tag_dict["_id"]),
        "name": tag_dict["name"],
        "type": tag_dict["type"],
        "ownerId": str(tag_dict["ownerId"]),
        "usageCount": 0,
        "createdAt": tag_dict["createdAt"]
    }


@router.get("", response_model=List[TagResponse])
async def get_tags(user_id: str = Depends(get_current_user_id)):
    """Get all tags (predefined + user's custom tags)"""
    db = get_database()
    
    # Get predefined tags and user's custom tags
    tags = await db.tags.find({
        "$or": [
            {"type": "predefined"},
            {"ownerId": ObjectId(user_id)}
        ]
    }).sort("name", 1).to_list(length=None)
    
    result = []
    for tag in tags:
        # Count usage
        usage_count = await db.notes.count_documents({
            "tagIds": tag["_id"],
            "ownerId": ObjectId(user_id),
            "deletedAt": None
        })
        
        result.append({
            "_id": str(tag["_id"]),
            "name": tag["name"],
            "type": tag["type"],
            "ownerId": str(tag["ownerId"]) if tag.get("ownerId") else None,
            "usageCount": usage_count,
            "createdAt": tag["createdAt"]
        })
    
    return result


@router.get("/{tag_id}", response_model=TagResponse)
async def get_tag(
    tag_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific tag"""
    db = get_database()
    
    if not ObjectId.is_valid(tag_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tag ID"
        )
    
    tag = await db.tags.find_one({
        "_id": ObjectId(tag_id),
        "$or": [
            {"type": "predefined"},
            {"ownerId": ObjectId(user_id)}
        ]
    })
    
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    # Count usage
    usage_count = await db.notes.count_documents({
        "tagIds": tag["_id"],
        "ownerId": ObjectId(user_id),
        "deletedAt": None
    })
    
    return {
        "_id": str(tag["_id"]),
        "name": tag["name"],
        "type": tag["type"],
        "ownerId": str(tag["ownerId"]) if tag.get("ownerId") else None,
        "usageCount": usage_count,
        "createdAt": tag["createdAt"]
    }


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a custom tag (only if not in use)"""
    db = get_database()
    
    if not ObjectId.is_valid(tag_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tag ID"
        )
    
    # Check if tag exists and is custom (not predefined)
    tag = await db.tags.find_one({
        "_id": ObjectId(tag_id),
        "type": "custom",
        "ownerId": ObjectId(user_id)
    })
    
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found or cannot be deleted"
        )
    
    # Check if tag is in use
    usage_count = await db.notes.count_documents({
        "tagIds": ObjectId(tag_id),
        "deletedAt": None
    })
    
    if usage_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tag is in use by {usage_count} note(s). Remove it from all notes first."
        )
    
    # Delete tag
    await db.tags.delete_one({"_id": ObjectId(tag_id)})
    
    return None
