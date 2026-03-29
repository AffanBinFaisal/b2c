"""Notes CRUD, pinning order, soft delete, limits, validation."""

from datetime import datetime

from bson import ObjectId
import pytest

from tests.helpers import create_collection, create_note, register_and_login


@pytest.mark.asyncio
async def test_create_get_update_delete_soft_trash_restore(client):
    headers = await register_and_login(client, email="n1@example.com", password="Str0ng!1a", name="N1")
    col = await create_collection(client, headers, "Notes Col")

    created = await create_note(
        client,
        headers,
        collection_ids=[col],
        title="Hello",
        content="<p>Rich text</p>",
    )
    nid = created["_id"]

    g = await client.get(f"/notes/{nid}", headers=headers)
    assert g.status_code == 200
    assert "<p>" in g.json()["content"]

    upd = await client.put(
        f"/notes/{nid}",
        headers=headers,
        json={"title": "Hello 2", "isPinned": True},
    )
    assert upd.status_code == 200
    assert upd.json()["title"] == "Hello 2"
    assert upd.json()["isPinned"] is True

    lst = await client.get("/notes", headers=headers)
    assert lst.status_code == 200
    items = lst.json()["items"]
    assert items[0]["isPinned"] is True

    d = await client.delete(f"/notes/{nid}", headers=headers)
    assert d.status_code == 204

    gone = await client.get(f"/notes/{nid}", headers=headers)
    assert gone.status_code == 404

    trash = await client.get("/notes/trash", headers=headers)
    assert trash.status_code == 200
    assert any(x["_id"] == nid for x in trash.json()["items"])

    rest = await client.post(f"/notes/{nid}/restore", headers=headers)
    assert rest.status_code == 200

    back = await client.get(f"/notes/{nid}", headers=headers)
    assert back.status_code == 200


@pytest.mark.asyncio
async def test_notes_pinned_ordering(client):
    headers = await register_and_login(client, email="n2@example.com", password="Str0ng!1a", name="N2")
    col = await create_collection(client, headers, "PCol")
    a = await create_note(client, headers, collection_ids=[col], title="A", content="a", is_pinned=False)
    await create_note(client, headers, collection_ids=[col], title="B", content="b", is_pinned=True)

    r = await client.get("/notes", headers=headers)
    items = r.json()["items"]
    assert items[0]["title"] == "B"
    assert items[0]["isPinned"] is True


@pytest.mark.asyncio
async def test_note_validation_title_and_tags(client):
    headers = await register_and_login(client, email="n3@example.com", password="Str0ng!1a", name="N3")
    col = await create_collection(client, headers, "VCol")

    bad = await client.post(
        "/notes",
        headers=headers,
        json={
            "title": "",
            "content": "x",
            "collectionIds": [col],
            "tagIds": [],
        },
    )
    assert bad.status_code == 422

    too_many_tags = ["507f1f77bcf86cd799439011"] * 21
    bad_tags = await client.post(
        "/notes",
        headers=headers,
        json={
            "title": "t",
            "content": "x",
            "collectionIds": [col],
            "tagIds": too_many_tags,
        },
    )
    assert bad_tags.status_code == 422


@pytest.mark.slow
@pytest.mark.asyncio
async def test_note_limit_1000_enforced(client):
    """Integration: API enforces 1000 active notes per user (Motor mocks are unreliable)."""
    headers = await register_and_login(client, email="n4@example.com", password="Str0ng!1a", name="N4")
    col_id = await create_collection(client, headers, "LCol")

    from app.database import get_database

    db = get_database()
    user = await db.users.find_one({"email": "n4@example.com"})
    uid = user["_id"]
    cid = ObjectId(col_id)
    now = datetime.utcnow()
    batch = [
        {
            "title": f"bulk{i}",
            "content": "x",
            "searchText": "x",
            "ownerId": uid,
            "collectionIds": [cid],
            "tagIds": [],
            "isPinned": False,
            "createdAt": now,
            "updatedAt": now,
            "createdBy": uid,
            "updatedBy": uid,
            "deletedAt": None,
        }
        for i in range(1000)
    ]
    await db.notes.insert_many(batch)

    r = await client.post(
        "/notes",
        headers=headers,
        json={
            "title": "Blocked",
            "content": "x",
            "collectionIds": [col_id],
            "tagIds": [],
        },
    )
    assert r.status_code == 400
    assert "1000" in r.json()["detail"]


@pytest.mark.asyncio
async def test_pin_unpin_endpoints(client):
    headers = await register_and_login(client, email="n6@example.com", password="Str0ng!1a", name="N6")
    col = await create_collection(client, headers, "PinCol")
    note = await create_note(client, headers, collection_ids=[col], title="P", content="p", is_pinned=False)
    nid = note["_id"]

    p = await client.post(f"/notes/{nid}/pin", headers=headers)
    assert p.status_code == 200
    assert p.json()["isPinned"] is True

    u = await client.post(f"/notes/{nid}/unpin", headers=headers)
    assert u.status_code == 200
    assert u.json()["isPinned"] is False


@pytest.mark.asyncio
async def test_note_requires_valid_collection(client):
    headers = await register_and_login(client, email="n5@example.com", password="Str0ng!1a", name="N5")
    r = await client.post(
        "/notes",
        headers=headers,
        json={
            "title": "x",
            "content": "y",
            "collectionIds": ["507f1f77bcf86cd799439011"],
            "tagIds": [],
        },
    )
    assert r.status_code == 400
