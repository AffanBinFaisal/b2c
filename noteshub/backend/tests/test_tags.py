"""Predefined + custom tags."""

import pytest

from tests.helpers import create_collection, create_note, register_and_login, tag_id_by_name


@pytest.mark.asyncio
async def test_list_tags_includes_predefined(client):
    headers = await register_and_login(client, email="t1@example.com", password="Str0ng!1a", name="T1")
    r = await client.get("/tags", headers=headers)
    assert r.status_code == 200
    names = {t["name"] for t in r.json()}
    assert {"decisions", "action-items", "research", "ideas", "reference"}.issubset(names)


@pytest.mark.asyncio
async def test_create_custom_tag_and_use_on_note(client):
    headers = await register_and_login(client, email="t2@example.com", password="Str0ng!1a", name="T2")
    col = await create_collection(client, headers, "TagCol")

    tr = await client.post("/tags", json={"name": "my-custom-tag"}, headers=headers)
    assert tr.status_code == 201
    tid = tr.json()["_id"]

    note = await create_note(
        client,
        headers,
        collection_ids=[col],
        title="Tagged",
        content="body",
        tag_ids=[tid],
    )
    assert tid in note["tagIds"]


@pytest.mark.asyncio
async def test_predefined_tag_on_note(client):
    headers = await register_and_login(client, email="t3@example.com", password="Str0ng!1a", name="T3")
    col = await create_collection(client, headers, "TC")
    rid = await tag_id_by_name(client, headers, "research")
    note = await create_note(
        client,
        headers,
        collection_ids=[col],
        title="R",
        content="c",
        tag_ids=[rid],
    )
    assert rid in note["tagIds"]


@pytest.mark.asyncio
async def test_delete_custom_tag_unused(client):
    headers = await register_and_login(client, email="t4@example.com", password="Str0ng!1a", name="T4")
    tr = await client.post("/tags", json={"name": "to-delete"}, headers=headers)
    tid = tr.json()["_id"]

    dr = await client.delete(f"/tags/{tid}", headers=headers)
    assert dr.status_code == 204


@pytest.mark.asyncio
async def test_delete_custom_tag_in_use_fails(client):
    headers = await register_and_login(client, email="t5@example.com", password="Str0ng!1a", name="T5")
    col = await create_collection(client, headers, "TD")
    tr = await client.post("/tags", json={"name": "in-use"}, headers=headers)
    tid = tr.json()["_id"]
    await create_note(client, headers, collection_ids=[col], title="x", content="y", tag_ids=[tid])

    dr = await client.delete(f"/tags/{tid}", headers=headers)
    assert dr.status_code == 400
