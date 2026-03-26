from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from app.database import get_database
from app.schemas.collection import CollectionCreate, CollectionUpdate, CollectionResponse
from app.utils.auth import get_current_user_id

router = APIRouter(prefix="/collections", tags=["Collections"])


@router.post("", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
async def create_collection(
    collection_data: CollectionCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new collection"""
    db = get_database()
    
    # Check if collection name already exists for this user
    existing = await db.collections.find_one({
        "ownerId": ObjectId(user_id),
        "name": collection_data.name
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Collection with this name already exists"
        )
    
    # Create collection
    collection_dict = {
        "name": collection_data.name,
        "ownerId": ObjectId(user_id),
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = await db.collections.insert_one(collection_dict)
    collection_dict["_id"] = result.inserted_id
    
    # Count notes in collection
    note_count = await db.notes.count_documents({
        "collectionIds": result.inserted_id,
        "deletedAt": None
    })
    
    return {
        "_id": str(collection_dict["_id"]),
        "name": collection_dict["name"],
        "ownerId": str(collection_dict["ownerId"]),
        "createdAt": collection_dict["createdAt"],
        "updatedAt": collection_dict["updatedAt"],
        "noteCount": note_count
    }


@router.get("", response_model=List[CollectionResponse])
async def get_collections(user_id: str = Depends(get_current_user_id)):
    """Get all collections for current user"""
    db = get_database()
    
    collections = await db.collections.find({
        "ownerId": ObjectId(user_id)
    }).sort("name", 1).to_list(length=None)
    
    # Get note counts for each collection
    result = []
    for collection in collections:
        note_count = await db.notes.count_documents({
            "collectionIds": collection["_id"],
            "deletedAt": None
        })
        
        result.append({
            "_id": str(collection["_id"]),
            "name": collection["name"],
            "ownerId": str(collection["ownerId"]),
            "createdAt": collection["createdAt"],
            "updatedAt": collection["updatedAt"],
            "noteCount": note_count
        })
    
    return result


@router.get("/{collection_id}", response_model=CollectionResponse)
async def get_collection(
    collection_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific collection"""
    db = get_database()
    
    if not ObjectId.is_valid(collection_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid collection ID"
        )
    
    collection = await db.collections.find_one({
        "_id": ObjectId(collection_id),
        "ownerId": ObjectId(user_id)
    })
    
    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found"
        )
    
    # Count notes in collection
    note_count = await db.notes.count_documents({
        "collectionIds": collection["_id"],
        "deletedAt": None
    })
    
    return {
        "_id": str(collection["_id"]),
        "name": collection["name"],
        "ownerId": str(collection["ownerId"]),
        "createdAt": collection["createdAt"],
        "updatedAt": collection["updatedAt"],
        "noteCount": note_count
    }


@router.put("/{collection_id}", response_model=CollectionResponse)
async def update_collection(
    collection_id: str,
    collection_data: CollectionUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update a collection (rename)"""
    db = get_database()
    
    if not ObjectId.is_valid(collection_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid collection ID"
        )
    
    # Check if collection exists and belongs to user
    collection = await db.collections.find_one({
        "_id": ObjectId(collection_id),
        "ownerId": ObjectId(user_id)
    })
    
    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found"
        )
    
    # Check if new name already exists for this user
    existing = await db.collections.find_one({
        "ownerId": ObjectId(user_id),
        "name": collection_data.name,
        "_id": {"$ne": ObjectId(collection_id)}
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Collection with this name already exists"
        )
    
    # Update collection
    await db.collections.update_one(
        {"_id": ObjectId(collection_id)},
        {
            "$set": {
                "name": collection_data.name,
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    # Get updated collection
    updated_collection = await db.collections.find_one({"_id": ObjectId(collection_id)})
    
    # Count notes
    note_count = await db.notes.count_documents({
        "collectionIds": updated_collection["_id"],
        "deletedAt": None
    })
    
    return {
        "_id": str(updated_collection["_id"]),
        "name": updated_collection["name"],
        "ownerId": str(updated_collection["ownerId"]),
        "createdAt": updated_collection["createdAt"],
        "updatedAt": updated_collection["updatedAt"],
        "noteCount": note_count
    }


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection(
    collection_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a collection and all its notes (hard delete)"""
    db = get_database()
    
    if not ObjectId.is_valid(collection_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid collection ID"
        )
    
    # Check if collection exists and belongs to user
    collection = await db.collections.find_one({
        "_id": ObjectId(collection_id),
        "ownerId": ObjectId(user_id)
    })
    
    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found"
        )
    
    # Hard delete all notes that belong ONLY to this collection
    await db.notes.delete_many({
        "ownerId": ObjectId(user_id),
        "collectionIds": [ObjectId(collection_id)]
    })
    
    # Remove collection from notes that belong to multiple collections
    await db.notes.update_many(
        {
            "ownerId": ObjectId(user_id),
            "collectionIds": ObjectId(collection_id)
        },
        {
            "$pull": {"collectionIds": ObjectId(collection_id)},
            "$set": {"updatedAt": datetime.utcnow()}
        }
    )
    
    # Delete the collection
    await db.collections.delete_one({"_id": ObjectId(collection_id)})
    
    return None
