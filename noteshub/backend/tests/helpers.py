"""Shared helpers for API integration tests."""

from __future__ import annotations

from typing import Any

from httpx import AsyncClient


async def register_user(
    client: AsyncClient,
    *,
    email: str = "alice@example.com",
    password: str = "Str0ng!pass",
    name: str = "Alice Test",
) -> None:
    r = await client.post(
        "/auth/register",
        json={"email": email, "password": password, "name": name},
    )
    assert r.status_code == 201, r.text


async def login(client: AsyncClient, email: str, password: str) -> str:
    r = await client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


def bearer(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def register_and_login(
    client: AsyncClient,
    *,
    email: str = "alice@example.com",
    password: str = "Str0ng!pass",
    name: str = "Alice Test",
) -> dict[str, str]:
    await register_user(client, email=email, password=password, name=name)
    token = await login(client, email, password)
    return bearer(token)


async def create_collection(client: AsyncClient, headers: dict[str, str], name: str) -> str:
    r = await client.post("/collections", json={"name": name}, headers=headers)
    assert r.status_code == 201, r.text
    return r.json()["_id"]


async def tag_id_by_name(client: AsyncClient, headers: dict[str, str], name: str) -> str:
    r = await client.get("/tags", headers=headers)
    assert r.status_code == 200, r.text
    for t in r.json():
        if t["name"] == name:
            return t["_id"]
    raise AssertionError(f"Tag {name!r} not found")


async def create_note(
    client: AsyncClient,
    headers: dict[str, str],
    *,
    collection_ids: list[str],
    title: str = "Note title",
    content: str = "Hello world searchable content.",
    tag_ids: list[str] | None = None,
    is_pinned: bool = False,
) -> dict[str, Any]:
    r = await client.post(
        "/notes",
        headers=headers,
        json={
            "title": title,
            "content": content,
            "collectionIds": collection_ids,
            "tagIds": tag_ids or [],
            "isPinned": is_pinned,
        },
    )
    assert r.status_code == 201, r.text
    return r.json()
