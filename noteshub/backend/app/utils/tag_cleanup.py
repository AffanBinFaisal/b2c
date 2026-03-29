from bson import ObjectId

from app.database import get_database


async def cleanup_custom_tags_no_longer_used(
    user_id: ObjectId,
    candidate_tag_ids: list,
) -> None:
    """Remove custom tags owned by user that have zero active notes referencing them."""
    if not candidate_tag_ids:
        return
    db = get_database()
    for tid in candidate_tag_ids:
        tag = await db.tags.find_one(
            {"_id": tid, "ownerId": user_id, "type": "custom"}
        )
        if not tag:
            continue
        count = await db.notes.count_documents(
            {"tagIds": tid, "deletedAt": None}
        )
        if count == 0:
            await db.tags.delete_one({"_id": tid})


async def cleanup_tags_after_note_removed(
    user_id: ObjectId,
    previous_tag_ids: list,
    new_tag_ids: list | None,
) -> None:
    """After a note update, drop custom tags that were removed and are now unused."""
    if not previous_tag_ids:
        return
    prev = set(previous_tag_ids)
    new_set = set(new_tag_ids or [])
    removed = list(prev - new_set)
    await cleanup_custom_tags_no_longer_used(user_id, removed)


async def cleanup_tags_after_note_deleted(user_id: ObjectId, tag_ids: list) -> None:
    """After soft-deleting a note, custom tags exclusively on that note may be removed."""
    await cleanup_custom_tags_no_longer_used(user_id, tag_ids)
