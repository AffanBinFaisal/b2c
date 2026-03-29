from datetime import datetime, timedelta

from bson import ObjectId

from app.config import settings
from app.database import get_database


async def purge_expired_soft_deletes() -> None:
    """
    Permanently remove soft-deleted notes and accounts past retention.
    Also removes stale auth tokens.
    """
    db = get_database()
    cutoff = datetime.utcnow() - timedelta(days=settings.SOFT_DELETE_RETENTION_DAYS)

    await db.notes.delete_many({"deletedAt": {"$lte": cutoff}})

    users = await db.users.find({"deletedAt": {"$lte": cutoff}}).to_list(length=None)
    for user in users:
        oid = user["_id"]
        await db.notes.delete_many({"ownerId": oid})
        await db.collections.delete_many({"ownerId": oid})
        await db.tags.delete_many({"ownerId": oid, "type": "custom"})
        await db.users.delete_one({"_id": oid})

    await db.auth_tokens.delete_many({"expiresAt": {"$lte": datetime.utcnow()}})
