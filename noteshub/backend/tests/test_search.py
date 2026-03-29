"""Full-text search, filters, AND/OR, sort, errors, timeout."""

import asyncio
from unittest.mock import patch

import pytest

from tests.helpers import create_collection, create_note, register_and_login, tag_id_by_name


@pytest.mark.asyncio
async def test_search_text_finds_note(client):
    headers = await register_and_login(client, email="s1@example.com", password="Str0ng!1a", name="S1")
    col = await create_collection(client, headers, "SearchCol")
    await create_note(
        client,
        headers,
        collection_ids=[col],
        title="Meeting notes",
        content="UniqueWordXYZ planning session",
    )

    r = await client.post(
        "/search",
        headers=headers,
        json={
            "query": "UniqueWordXYZ",
            "collectionIds": [],
            "tagIds": [],
            "logic": "AND",
            "sortBy": "relevance",
            "page": 1,
            "limit": 20,
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert data["total"] >= 1
    assert any(x["title"] == "Meeting notes" for x in data["results"])


@pytest.mark.asyncio
async def test_search_and_requires_all_collections(client):
    headers = await register_and_login(client, email="s2@example.com", password="Str0ng!1a", name="S2")
    a = await create_collection(client, headers, "SA")
    b = await create_collection(client, headers, "SB")
    await create_note(client, headers, collection_ids=[a], title="OnlyA", content="alpha beta")
    await create_note(client, headers, collection_ids=[a, b], title="Both", content="gamma delta")

    r = await client.post(
        "/search",
        headers=headers,
        json={
            "query": "",
            "collectionIds": [a, b],
            "tagIds": [],
            "logic": "AND",
            "sortBy": "updatedAt",
            "page": 1,
            "limit": 20,
        },
    )
    assert r.status_code == 200
    titles = {x["title"] for x in r.json()["results"]}
    assert "Both" in titles
    assert "OnlyA" not in titles


@pytest.mark.asyncio
async def test_search_or_collection_filter(client):
    headers = await register_and_login(client, email="s3@example.com", password="Str0ng!1a", name="S3")
    a = await create_collection(client, headers, "S3A")
    b = await create_collection(client, headers, "S3B")
    await create_note(client, headers, collection_ids=[a], title="InA", content="x")
    await create_note(client, headers, collection_ids=[b], title="InB", content="y")

    r = await client.post(
        "/search",
        headers=headers,
        json={
            "query": "",
            "collectionIds": [a, b],
            "tagIds": [],
            "logic": "OR",
            "sortBy": "updatedAt",
            "page": 1,
            "limit": 20,
        },
    )
    assert r.status_code == 200
    titles = {x["title"] for x in r.json()["results"]}
    assert titles == {"InA", "InB"}


@pytest.mark.asyncio
async def test_search_invalid_collection_id_400(client):
    headers = await register_and_login(client, email="s4@example.com", password="Str0ng!1a", name="S4")
    r = await client.post(
        "/search",
        headers=headers,
        json={
            "query": "",
            "collectionIds": ["not-valid"],
            "tagIds": [],
            "logic": "AND",
            "sortBy": "relevance",
            "page": 1,
            "limit": 20,
        },
    )
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_search_default_logic_from_preferences(client):
    headers = await register_and_login(client, email="s5@example.com", password="Str0ng!1a", name="S5")
    await client.put(
        "/auth/me",
        headers=headers,
        json={"preferences": {"searchLogic": "OR"}},
    )

    me = await client.get("/auth/me", headers=headers)
    assert me.json()["preferences"]["searchLogic"] == "OR"

    r = await client.post(
        "/search",
        headers=headers,
        json={
            "query": "",
            "collectionIds": [],
            "tagIds": [],
            "sortBy": "updatedAt",
            "page": 1,
            "limit": 20,
        },
    )
    assert r.status_code == 200


@pytest.mark.filterwarnings("ignore:coroutine .* was never awaited:RuntimeWarning")
@pytest.mark.asyncio
async def test_search_times_out_returns_504(client, monkeypatch):
    headers = await register_and_login(client, email="s6@example.com", password="Str0ng!1a", name="S6")

    async def boom(*args, **kwargs):
        raise asyncio.TimeoutError()

    with patch("app.routes.search.asyncio.wait_for", boom):
        r = await client.post(
            "/search",
            headers=headers,
            json={
                "query": "anything",
                "collectionIds": [],
                "tagIds": [],
                "logic": "AND",
                "sortBy": "relevance",
                "page": 1,
                "limit": 20,
            },
        )
    assert r.status_code == 504
    assert "timed out" in r.json()["detail"].lower()


@pytest.mark.asyncio
async def test_search_tag_filter_and_logic(client):
    headers = await register_and_login(client, email="s7@example.com", password="Str0ng!1a", name="S7")
    col = await create_collection(client, headers, "ST")
    ideas = await tag_id_by_name(client, headers, "ideas")
    ref = await tag_id_by_name(client, headers, "reference")
    await create_note(
        client,
        headers,
        collection_ids=[col],
        title="T1",
        content="c1",
        tag_ids=[ideas],
    )
    await create_note(
        client,
        headers,
        collection_ids=[col],
        title="T2",
        content="c2",
        tag_ids=[ref],
    )

    r = await client.post(
        "/search",
        headers=headers,
        json={
            "query": "",
            "collectionIds": [],
            "tagIds": [ideas, ref],
            "logic": "AND",
            "sortBy": "updatedAt",
            "page": 1,
            "limit": 20,
        },
    )
    assert r.status_code == 200
    assert r.json()["total"] == 0
