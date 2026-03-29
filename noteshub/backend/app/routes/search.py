import asyncio
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from app.database import get_database
from app.schemas.search import SearchRequest, SearchResponse
from app.utils.auth import get_current_user
from app.utils.helpers import object_id_list, str_id_list, create_content_preview
from app.config import settings

router = APIRouter(prefix="/search", tags=["Search"])


@router.post("", response_model=SearchResponse)
async def search_notes(
    search_data: SearchRequest,
    current_user: dict = Depends(get_current_user),
):
    """Search notes with full-text search and filters (timeout and result cap per PRD)."""
    db = get_database()
    user_id = str(current_user["_id"])
    cap = settings.SEARCH_MAX_TOTAL_RESULTS

    prefs = current_user.get("preferences") or {}
    effective_logic = search_data.logic
    if effective_logic is None:
        sl = prefs.get("searchLogic")
        effective_logic = sl if sl in ("AND", "OR") else "AND"

    query = {
        "ownerId": ObjectId(user_id),
        "deletedAt": None,
    }

    if search_data.query.strip():
        query["$text"] = {"$search": search_data.query}

    filter_conditions = []

    if search_data.collectionIds:
        try:
            collection_ids = object_id_list(search_data.collectionIds)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more collection IDs are invalid",
            )
        if effective_logic == "AND":
            query["collectionIds"] = {"$all": collection_ids}
        else:
            filter_conditions.append({"collectionIds": {"$in": collection_ids}})

    if search_data.tagIds:
        try:
            tag_ids = object_id_list(search_data.tagIds)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more tag IDs are invalid",
            )
        if effective_logic == "AND":
            query["tagIds"] = {"$all": tag_ids}
        else:
            filter_conditions.append({"tagIds": {"$in": tag_ids}})

    if filter_conditions and effective_logic == "OR":
        if len(filter_conditions) > 1:
            query["$or"] = filter_conditions
        else:
            query.update(filter_conditions[0])

    skip = (search_data.page - 1) * search_data.limit

    # Pinned notes first on all sorts (PRD). Use one .sort([...]) — PyMongo replaces sort on repeat calls.
    if search_data.sortBy == "relevance" and search_data.query.strip():
        sort_criteria = [
            ("isPinned", -1),
            ("score", {"$meta": "textScore"}),
            ("updatedAt", -1),
        ]
        projection = {
            "title": 1,
            "content": 1,
            "ownerId": 1,
            "collectionIds": 1,
            "tagIds": 1,
            "isPinned": 1,
            "updatedAt": 1,
            "score": {"$meta": "textScore"},
        }
    else:
        sort_criteria = [("isPinned", -1), ("updatedAt", -1)]
        projection = None

    async def _execute():
        total_matches = await db.notes.count_documents(query)
        effective_total = min(total_matches, cap)

        if skip >= effective_total:
            return [], total_matches, effective_total

        fetch_limit = min(search_data.limit, effective_total - skip)

        if projection:
            cursor = db.notes.find(query, projection)
        else:
            cursor = db.notes.find(query)

        cursor = cursor.sort(sort_criteria)

        notes = await cursor.skip(skip).limit(fetch_limit).to_list(length=fetch_limit)
        return notes, total_matches, effective_total

    try:
        notes, total_matches, effective_total = await asyncio.wait_for(
            _execute(),
            timeout=settings.SEARCH_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Search timed out. Try narrowing your filters.",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Search operation failed",
        )

    results = []
    use_score = projection is not None
    for note in notes:
        results.append(
            {
                "_id": str(note["_id"]),
                "title": note["title"],
                "contentPreview": create_content_preview(note["content"]),
                "ownerId": str(note["ownerId"]),
                "collectionIds": str_id_list(note["collectionIds"]),
                "tagIds": str_id_list(note["tagIds"]),
                "isPinned": note["isPinned"],
                "updatedAt": note["updatedAt"].isoformat(),
                "relevanceScore": note.get("score", 0) if use_score else 0,
            }
        )

    total_pages = (
        (effective_total + search_data.limit - 1) // search_data.limit
        if effective_total
        else 0
    )

    return {
        "results": results,
        "total": effective_total,
        "totalMatches": total_matches,
        "page": search_data.page,
        "limit": search_data.limit,
        "totalPages": total_pages,
    }
