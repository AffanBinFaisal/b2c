"""Pure Pydantic validation (no MongoDB)."""

import pytest
from pydantic import ValidationError

from app.schemas.collection import CollectionCreate
from app.schemas.note import NoteCreate
from app.schemas.user import UserRegister


def test_user_register_password_rules():
    with pytest.raises(ValidationError):
        UserRegister(email="a@b.co", password="short", name="Ab")
    with pytest.raises(ValidationError):
        UserRegister(email="a@b.co", password="NoDigit!xx", name="Ab")
    u = UserRegister(email="a@b.co", password="Ok1!abcd", name="Ab")
    assert u.email == "a@b.co"


def test_user_register_name_max_length():
    with pytest.raises(ValidationError):
        UserRegister(email="a@b.co", password="Ok1!abcd", name="x" * 101)
    u = UserRegister(email="a@b.co", password="Ok1!abcd", name="x" * 100)
    assert len(u.name) == 100


def test_note_create_constraints():
    with pytest.raises(ValidationError):
        NoteCreate(title="", content="x", collectionIds=["507f1f77bcf86cd799439011"])
    with pytest.raises(ValidationError):
        NoteCreate(title="t", content="x", collectionIds=[])
    with pytest.raises(ValidationError):
        NoteCreate(
            title="t",
            content="x",
            collectionIds=["507f1f77bcf86cd799439011"],
            tagIds=["507f1f77bcf86cd799439011"] * 21,
        )


def test_collection_name_pattern():
    CollectionCreate(name="Valid_Name-1")
    with pytest.raises(ValidationError):
        CollectionCreate(name="bad!")
