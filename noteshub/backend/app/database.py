from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, TEXT
from app.config import settings

client = None
database = None


async def connect_to_mongo():
    """Connect to MongoDB"""
    global client, database
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    database = client[settings.DATABASE_NAME]
    
    # Create indexes
    await create_indexes()
    
    # Initialize predefined tags
    await initialize_predefined_tags()
    
    print(f"Connected to MongoDB: {settings.DATABASE_NAME}")


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
    
    # Text index for search (title weighted higher than content)
    await database.notes.create_index([
        ("title", TEXT),
        ("content", TEXT)
    ], weights={"title": 10, "content": 1})
    
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
