from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, TEXT
from app.config import settings
import certifi

client = None
database = None


def _mongo_client_kwargs(url: str) -> dict:
    """Atlas / mongodb+srv needs TLS; plain localhost typically does not."""
    opts = {
        "serverSelectionTimeoutMS": 30000,
        "connectTimeoutMS": 30000,
        "socketTimeoutMS": 30000,
    }
    u = url.lower()
    if u.startswith("mongodb+srv://") or ".mongodb.net" in u:
        opts.update(
            {
                "tls": True,
                "tlsAllowInvalidCertificates": False,
                "tlsAllowInvalidHostnames": False,
                "tlsCAFile": certifi.where(),
            }
        )
    return opts


async def connect_to_mongo():
    """Connect to MongoDB"""
    global client, database

    client = AsyncIOMotorClient(settings.MONGODB_URL, **_mongo_client_kwargs(settings.MONGODB_URL))
    
    database = client[settings.DATABASE_NAME]
    
    # Test connection
    try:
        await client.admin.command('ping')
        print(f"Successfully connected to MongoDB: {settings.DATABASE_NAME}")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        raise

    # One text index per collection: drop legacy index before create_indexes
    await migrate_note_text_index()

    # Create indexes
    await create_indexes()

    await backfill_note_search_text()

    # Initialize predefined tags
    await initialize_predefined_tags()


async def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("Closed MongoDB connection")


async def create_indexes():
    """Create database indexes for performance"""
    # User indexes
    await database.users.create_index([("email", ASCENDING)], unique=True)
    
    # Collection indexes
    await database.collections.create_index([("ownerId", ASCENDING)])
    await database.collections.create_index([("ownerId", ASCENDING), ("name", ASCENDING)], unique=True)
    
    # Note indexes
    await database.notes.create_index([("ownerId", ASCENDING)])
    await database.notes.create_index([("ownerId", ASCENDING), ("isPinned", ASCENDING)])
    await database.notes.create_index([("collectionIds", ASCENDING)])
    await database.notes.create_index([("tagIds", ASCENDING)])
    await database.notes.create_index([("updatedAt", ASCENDING)])
    
    # Text index: title + plain searchText (HTML stripped from body)
    await database.notes.create_index(
        [("title", TEXT), ("searchText", TEXT)],
        weights={"title": 10, "searchText": 1},
    )

    await database.auth_tokens.create_index([("tokenHash", ASCENDING)], unique=True)
    await database.auth_tokens.create_index([("expiresAt", ASCENDING)])
    
    # Tag indexes
    await database.tags.create_index([("name", ASCENDING)])
    await database.tags.create_index([("type", ASCENDING)])
    await database.tags.create_index([("ownerId", ASCENDING)])


async def initialize_predefined_tags():
    """Initialize predefined system tags"""
    predefined_tags = [
        {"name": "decisions", "type": "predefined", "ownerId": None},
        {"name": "action-items", "type": "predefined", "ownerId": None},
        {"name": "research", "type": "predefined", "ownerId": None},
        {"name": "ideas", "type": "predefined", "ownerId": None},
        {"name": "reference", "type": "predefined", "ownerId": None}
    ]
    
    for tag in predefined_tags:
        existing = await database.tags.find_one({"name": tag["name"], "type": "predefined"})
        if not existing:
            tag["createdAt"] = datetime.utcnow()
            await database.tags.insert_one(tag)
        elif "createdAt" not in existing:
            await database.tags.update_one(
                {"_id": existing["_id"]},
                {"$set": {"createdAt": datetime.utcnow()}}
            )


def get_database():
    """Get database instance"""
    return database


async def migrate_note_text_index():
    """Drop legacy text index that used content field instead of searchText."""
    if database is None:
        return
    try:
        async for idx in database.notes.list_indexes():
            w = idx.get("weights") or {}
            if "content" in w and idx.get("name") and idx["name"] != "_id_":
                await database.notes.drop_index(idx["name"])
                break
    except Exception:
        pass


async def backfill_note_search_text():
    """Populate searchText for notes missing it (plain text from stored HTML or legacy plain content)."""
    if database is None:
        return
    from app.utils.helpers import html_to_plain_text

    cursor = database.notes.find(
        {"$or": [{"searchText": {"$exists": False}}, {"searchText": None}]}
    )
    async for note in cursor:
        content = note.get("content") or ""
        st = html_to_plain_text(content) if content else ""
        await database.notes.update_one(
            {"_id": note["_id"]},
            {"$set": {"searchText": st[:100000]}},
        )
