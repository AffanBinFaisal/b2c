"""Authentication and profile flows."""

import pytest
from datetime import datetime, timedelta

from tests.helpers import bearer, login, register_user


@pytest.mark.asyncio
async def test_register_login_me_put_logout(client):
    await register_user(client, email="u1@example.com", password="Str0ng!1a", name="User One")
    token = await login(client, "u1@example.com", "Str0ng!1a")
    headers = bearer(token)

    me = await client.get("/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == "u1@example.com"
    assert me.json()["preferences"]["searchLogic"] == "AND"

    upd = await client.put(
        "/auth/me",
        headers=headers,
        json={"name": "User One Updated", "preferences": {"searchLogic": "OR"}},
    )
    assert upd.status_code == 200
    assert upd.json()["name"] == "User One Updated"
    assert upd.json()["preferences"]["searchLogic"] == "OR"

    out = await client.post("/auth/logout", headers=headers)
    assert out.status_code == 200


@pytest.mark.asyncio
async def test_register_duplicate_email_400(client):
    await register_user(client, email="dup@example.com", password="Str0ng!1a", name="A1")
    r = await client.post(
        "/auth/register",
        json={"email": "dup@example.com", "password": "Str0ng!1b", "name": "Bb"},
    )
    assert r.status_code == 400
    assert "already" in r.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_wrong_password_401(client):
    await register_user(client, email="lw@example.com", password="Str0ng!1a", name="Le")
    r = await client.post("/auth/login", json={"email": "lw@example.com", "password": "Wrong1!x"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_register_validation_password_and_name(client):
    r = await client.post(
        "/auth/register",
        json={"email": "bad@example.com", "password": "short", "name": "No"},
    )
    assert r.status_code == 422

    r2 = await client.post(
        "/auth/register",
        json={"email": "bad2@example.com", "password": "NoDigit!xx", "name": "Valid Name"},
    )
    assert r2.status_code == 422


@pytest.mark.asyncio
async def test_put_me_name_too_short_422(client):
    await register_user(client, email="nv@example.com", password="Str0ng!1a", name="Valid")
    token = await login(client, "nv@example.com", "Str0ng!1a")
    r = await client.put("/auth/me", headers=bearer(token), json={"name": "x"})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_change_password(client):
    await register_user(client, email="cp@example.com", password="Str0ng!1a", name="Cp")
    token = await login(client, "cp@example.com", "Str0ng!1a")
    headers = bearer(token)

    bad = await client.post(
        "/auth/change-password",
        headers=headers,
        json={"currentPassword": "wrong", "newPassword": "Newpass!2b"},
    )
    assert bad.status_code == 400

    ok = await client.post(
        "/auth/change-password",
        headers=headers,
        json={"currentPassword": "Str0ng!1a", "newPassword": "Newpass!2b"},
    )
    assert ok.status_code == 200

    old_login = await client.post(
        "/auth/login", json={"email": "cp@example.com", "password": "Str0ng!1a"}
    )
    assert old_login.status_code == 401

    new_login = await client.post(
        "/auth/login", json={"email": "cp@example.com", "password": "Newpass!2b"}
    )
    assert new_login.status_code == 200


@pytest.mark.asyncio
async def test_soft_delete_and_recover_account(client):
    await register_user(client, email="sd@example.com", password="Str0ng!1a", name="Sd")
    token = await login(client, "sd@example.com", "Str0ng!1a")
    headers = bearer(token)

    del_r = await client.delete("/auth/me", headers=headers)
    assert del_r.status_code == 200

    blocked = await client.get("/auth/me", headers=headers)
    assert blocked.status_code == 401

    login_del = await client.post(
        "/auth/login", json={"email": "sd@example.com", "password": "Str0ng!1a"}
    )
    assert login_del.status_code == 403

    rec = await client.post(
        "/auth/recover",
        json={"email": "sd@example.com", "password": "Str0ng!1a"},
    )
    assert rec.status_code == 200
    assert "access_token" in rec.json()

    me_ok = await client.get("/auth/me", headers=bearer(rec.json()["access_token"]))
    assert me_ok.status_code == 200


@pytest.mark.asyncio
async def test_verify_email_with_token(client):
    from app.config import settings
    from app.database import get_database
    from app.utils.tokens import generate_raw_token, hash_token

    settings.AUTO_VERIFY_EMAIL = False
    try:
        r = await client.post(
            "/auth/register",
            json={"email": "ver@example.com", "password": "Str0ng!1a", "name": "Vx"},
        )
        assert r.status_code == 201

        db = get_database()
        user = await db.users.find_one({"email": "ver@example.com"})
        assert user["emailVerified"] is False

        raw = generate_raw_token()
        await db.auth_tokens.insert_one(
            {
                "type": "email_verify",
                "userId": user["_id"],
                "tokenHash": hash_token(raw),
                "expiresAt": datetime.utcnow() + timedelta(hours=1),
                "createdAt": datetime.utcnow(),
            }
        )

        vr = await client.post("/auth/verify-email", json={"token": raw})
        assert vr.status_code == 200

        user2 = await db.users.find_one({"_id": user["_id"]})
        assert user2["emailVerified"] is True

        login_ok = await client.post(
            "/auth/login",
            json={"email": "ver@example.com", "password": "Str0ng!1a"},
        )
        assert login_ok.status_code == 200
    finally:
        settings.AUTO_VERIFY_EMAIL = True


@pytest.mark.asyncio
async def test_reset_password_with_token(client):
    from app.database import get_database
    from app.utils.auth import verify_password
    from app.utils.tokens import generate_raw_token, hash_token

    await register_user(client, email="rp@example.com", password="Str0ng!1a", name="Rp")
    db = get_database()
    user = await db.users.find_one({"email": "rp@example.com"})

    raw = generate_raw_token()
    await db.auth_tokens.insert_one(
        {
            "type": "password_reset",
            "userId": user["_id"],
            "tokenHash": hash_token(raw),
            "expiresAt": datetime.utcnow() + timedelta(hours=1),
            "createdAt": datetime.utcnow(),
        }
    )

    rs = await client.post(
        "/auth/reset-password",
        json={"token": raw, "newPassword": "Reset!9zz"},
    )
    assert rs.status_code == 200

    u = await db.users.find_one({"_id": user["_id"]})
    assert verify_password("Reset!9zz", u["passwordHash"])

    login_new = await client.post(
        "/auth/login",
        json={"email": "rp@example.com", "password": "Reset!9zz"},
    )
    assert login_new.status_code == 200


@pytest.mark.asyncio
async def test_forgot_password_is_generic(client):
    await register_user(client, email="fp@example.com", password="Str0ng!1a", name="Fp")
    r = await client.post("/auth/forgot-password", json={"email": "fp@example.com"})
    assert r.status_code == 200
    assert "message" in r.json()
