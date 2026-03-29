"""Collections CRUD, uniqueness, delete impact, cascade."""

import pytest

from tests.helpers import create_collection, create_note, register_and_login


@pytest.mark.asyncio
async def test_create_list_get_rename_delete(client):
    headers = await register_and_login(client, email="col@example.com", password="Str0ng!1a", name="Co")

    c1 = await client.post("/collections", json={"name": "Project Alpha"}, headers=headers)
    assert c1.status_code == 201
    cid = c1.json()["_id"]

    dup = await client.post("/collections", json={"name": "Project Alpha"}, headers=headers)
    assert dup.status_code == 400

    lst = await client.get("/collections", headers=headers)
    assert lst.status_code == 200
    assert len(lst.json()) == 1

    one = await client.get(f"/collections/{cid}", headers=headers)
    assert one.status_code == 200
    assert one.json()["name"] == "Project Alpha"

    ren = await client.put(f"/collections/{cid}", json={"name": "Renamed"}, headers=headers)
    assert ren.status_code == 200
    assert ren.json()["name"] == "Renamed"

    impact = await client.get(f"/collections/{cid}/delete-impact", headers=headers)
    assert impact.status_code == 200
    assert impact.json()["totalNotesInCollection"] == 0

    del_r = await client.delete(f"/collections/{cid}", headers=headers)
    assert del_r.status_code == 204

    missing = await client.get(f"/collections/{cid}", headers=headers)
    assert missing.status_code == 404


@pytest.mark.asyncio
async def test_delete_collection_hard_deletes_only_single_collection_note(client):
    headers = await register_and_login(client, email="c2@example.com", password="Str0ng!1a", name="C2")
    a = await create_collection(client, headers, "A")
    b = await create_collection(client, headers, "B")

    only_a = await create_note(client, headers, collection_ids=[a], title="Only A", content="x")
    in_both = await create_note(
        client, headers, collection_ids=[a, b], title="Both", content="y"
    )

    await client.delete(f"/collections/{a}", headers=headers)

    assert (await client.get(f"/notes/{only_a['_id']}", headers=headers)).status_code == 404

    r2 = await client.get(f"/notes/{in_both['_id']}", headers=headers)
    assert r2.status_code == 200
    coll_ids = set(r2.json()["collectionIds"])
    assert b in coll_ids
    assert a not in coll_ids


@pytest.mark.asyncio
async def test_delete_impact_counts(client):
    headers = await register_and_login(client, email="c3@example.com", password="Str0ng!1a", name="C3")
    a = await create_collection(client, headers, "A1")
    b = await create_collection(client, headers, "B1")
    await create_note(client, headers, collection_ids=[a], title="solo", content="z")
    await create_note(client, headers, collection_ids=[a, b], title="multi", content="z")

    imp = await client.get(f"/collections/{a}/delete-impact", headers=headers)
    assert imp.status_code == 200
    body = imp.json()
    assert body["hardDeleteCount"] == 1
    assert body["unlinkFromCollectionCount"] == 1


@pytest.mark.asyncio
async def test_invalid_collection_id_400(client):
    headers = await register_and_login(client, email="c4@example.com", password="Str0ng!1a", name="C4")
    r = await client.get("/collections/not-an-objectid", headers=headers)
    assert r.status_code == 400
