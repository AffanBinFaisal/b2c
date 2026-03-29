"""Dashboard aggregates and export."""

import pytest

from tests.helpers import create_collection, create_note, register_and_login


@pytest.mark.asyncio
async def test_dashboard_shape(client):
    headers = await register_and_login(client, email="a1@example.com", password="Str0ng!1a", name="A1")
    col = await create_collection(client, headers, "DashCol")
    await create_note(client, headers, collection_ids=[col], title="N1", content="analytics body text")

    r = await client.get("/analytics/dashboard", headers=headers)
    assert r.status_code == 200
    body = r.json()
    assert "totalNotes" in body
    assert "pinnedNotes" in body
    assert "totalCollections" in body
    assert "customTags" in body
    assert "notesPerCollection" in body
    assert "topTags" in body
    assert "recentActivity" in body
    assert isinstance(body["notesPerCollection"], list)
    assert isinstance(body["topTags"], list)
    assert isinstance(body["recentActivity"], list)


@pytest.mark.asyncio
async def test_export_contains_user_notes_collections(client):
    headers = await register_and_login(client, email="a2@example.com", password="Str0ng!1a", name="A2")
    col = await create_collection(client, headers, "ExportCol")
    await create_note(client, headers, collection_ids=[col], title="Exportable", content="data")

    r = await client.get("/analytics/export", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["user"]["email"] == "a2@example.com"
    assert len(data["collections"]) >= 1
    assert any(n["title"] == "Exportable" for n in data["notes"])
    assert "exportedAt" in data


@pytest.mark.asyncio
async def test_analytics_requires_auth(client):
    r = await client.get("/analytics/dashboard")
    assert r.status_code == 401
