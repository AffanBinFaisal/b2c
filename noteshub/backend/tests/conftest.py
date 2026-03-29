"""Pytest fixtures: isolated test DB, async HTTP client, autouse reset."""

from __future__ import annotations

import os

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

# Configure test settings before app/database import side effects
os.environ.setdefault("TEST_DATABASE_NAME", "noteshub_test")
os.environ.setdefault("TEST_MONGODB_URL", "mongodb://localhost:27017")


@pytest_asyncio.fixture(scope="session")
async def mongo_session():
    from app.config import settings
    from app.database import close_mongo_connection, connect_to_mongo

    settings.DATABASE_NAME = os.environ["TEST_DATABASE_NAME"]
    settings.MONGODB_URL = os.environ["TEST_MONGODB_URL"]
    settings.AUTO_VERIFY_EMAIL = True
    settings.SECRET_KEY = "test-secret-key-for-jwt-signing-only"

    try:
        await connect_to_mongo()
    except Exception as e:
        pytest.skip(f"MongoDB not available ({settings.MONGODB_URL}): {e}")

    yield

    await close_mongo_connection()


@pytest_asyncio.fixture(autouse=True)
async def reset_database(mongo_session):
    from app.database import create_indexes, get_database, initialize_predefined_tags

    db = get_database()
    for name in await db.list_collection_names():
        if name.startswith("system."):
            continue
        await db.drop_collection(name)

    await create_indexes()
    await initialize_predefined_tags()


@pytest_asyncio.fixture
async def client(mongo_session):
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
