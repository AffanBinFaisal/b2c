from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from bson import ObjectId
from app.database import get_database
from app.utils.auth import get_current_user_id

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard")
async def get_dashboard_analytics(user_id: str = Depends(get_current_user_id)):
    """Get dashboard analytics and statistics"""
    db = get_database()
    
    # Total notes count
    total_notes = await db.notes.count_documents({
        "ownerId": ObjectId(user_id),
        "deletedAt": None
    })
    
    # Notes per collection
    notes_per_collection = await db.notes.aggregate([
        {
            "$match": {
                "ownerId": ObjectId(user_id),
                "deletedAt": None
            }
        },
        {
            "$unwind": "$collectionIds"
        },
        {
            "$group": {
                "_id": "$collectionIds",
                "count": {"$sum": 1}
            }
        },
        {
            "$lookup": {
                "from": "collections",
                "localField": "_id",
                "foreignField": "_id",
                "as": "collection"
            }
        },
        {
            "$unwind": "$collection"
        },
        {
            "$project": {
                "_id": 0,
                "collectionId": {"$toString": "$_id"},
                "collectionName": "$collection.name",
                "noteCount": "$count"
            }
        },
        {
            "$sort": {"noteCount": -1}
        }
    ]).to_list(length=None)
    
    # Top 10 most used tags
    top_tags = await db.notes.aggregate([
        {
            "$match": {
                "ownerId": ObjectId(user_id),
                "deletedAt": None
            }
        },
        {
            "$unwind": "$tagIds"
        },
        {
            "$group": {
                "_id": "$tagIds",
                "count": {"$sum": 1}
            }
        },
        {
            "$lookup": {
                "from": "tags",
                "localField": "_id",
                "foreignField": "_id",
                "as": "tag"
            }
        },
        {
            "$unwind": "$tag"
        },
        {
            "$project": {
                "_id": 0,
                "tagId": {"$toString": "$_id"},
                "tagName": "$tag.name",
                "tagType": "$tag.type",
                "usageCount": "$count"
            }
        },
        {
            "$sort": {"usageCount": -1}
        },
        {
            "$limit": 10
        }
    ]).to_list(length=10)
    
    # Recent activity (last 10 notes updated)
    recent_notes = await db.notes.find({
        "ownerId": ObjectId(user_id),
        "deletedAt": None
    }).sort("updatedAt", -1).limit(10).to_list(length=10)
    
    recent_activity = []
    for note in recent_notes:
        recent_activity.append({
            "noteId": str(note["_id"]),
            "title": note["title"],
            "updatedAt": note["updatedAt"].isoformat(),
            "isPinned": note["isPinned"]
        })
    
    # Pinned notes count
    pinned_count = await db.notes.count_documents({
        "ownerId": ObjectId(user_id),
        "deletedAt": None,
        "isPinned": True
    })
    
    # Collections count
    collections_count = await db.collections.count_documents({
        "ownerId": ObjectId(user_id)
    })
    
    # Custom tags count
    custom_tags_count = await db.tags.count_documents({
        "ownerId": ObjectId(user_id),
        "type": "custom"
    })
    
    return {
        "totalNotes": total_notes,
        "pinnedNotes": pinned_count,
        "totalCollections": collections_count,
        "customTags": custom_tags_count,
        "notesPerCollection": notes_per_collection,
        "topTags": top_tags,
        "recentActivity": recent_activity
    }


@router.get("/export")
async def export_user_data(user_id: str = Depends(get_current_user_id)):
    """Export all user data as JSON"""
    db = get_database()
    
    # Get user profile
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    user_data = {
        "email": user["email"],
        "name": user["name"],
        "createdAt": user["createdAt"].isoformat(),
        "preferences": user.get("preferences", {})
    }
    
    # Get collections
    collections = await db.collections.find({
        "ownerId": ObjectId(user_id)
    }).to_list(length=None)
    
    collections_data = []
    for collection in collections:
        collections_data.append({
            "id": str(collection["_id"]),
            "name": collection["name"],
            "createdAt": collection["createdAt"].isoformat(),
            "updatedAt": collection["updatedAt"].isoformat()
        })
    
    # Get notes
    notes = await db.notes.find({
        "ownerId": ObjectId(user_id),
        "deletedAt": None
    }).to_list(length=None)

    # Build lookup maps once to avoid per-note DB queries.
    collection_lookup = {collection["_id"]: collection["name"] for collection in collections}
    note_tag_ids = set()
    for note in notes:
        note_tag_ids.update(note.get("tagIds", []))
    tags_for_lookup = []
    if note_tag_ids:
        tags_for_lookup = await db.tags.find({"_id": {"$in": list(note_tag_ids)}}).to_list(length=None)
    tag_lookup = {tag["_id"]: tag["name"] for tag in tags_for_lookup}
    
    notes_data = []
    for note in notes:
        collection_names = [
            collection_lookup[coll_id]
            for coll_id in note.get("collectionIds", [])
            if coll_id in collection_lookup
        ]
        tag_names = [
            tag_lookup[tag_id]
            for tag_id in note.get("tagIds", [])
            if tag_id in tag_lookup
        ]
        
        notes_data.append({
            "id": str(note["_id"]),
            "title": note["title"],
            "content": note["content"],
            "collections": collection_names,
            "tags": tag_names,
            "isPinned": note["isPinned"],
            "createdAt": note["createdAt"].isoformat(),
            "updatedAt": note["updatedAt"].isoformat()
        })
    
    # Get custom tags
    tags = await db.tags.find({
        "ownerId": ObjectId(user_id),
        "type": "custom"
    }).to_list(length=None)
    
    tags_data = []
    for tag in tags:
        tags_data.append({
            "id": str(tag["_id"]),
            "name": tag["name"],
            "createdAt": tag["createdAt"].isoformat()
        })
    
    return {
        "user": user_data,
        "collections": collections_data,
        "notes": notes_data,
        "customTags": tags_data,
        "exportedAt": ObjectId().generation_time.isoformat()
    }
