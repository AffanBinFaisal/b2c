from typing import List
from bson import ObjectId


def object_id_list(ids: List[str]) -> List[ObjectId]:
    """Convert list of string IDs to ObjectId list"""
    invalid_ids = [id for id in ids if not ObjectId.is_valid(id)]
    if invalid_ids:
        raise ValueError("One or more IDs are invalid")
    return [ObjectId(id) for id in ids]


def str_id_list(ids: List[ObjectId]) -> List[str]:
    """Convert list of ObjectIds to string list"""
    return [str(id) for id in ids]


def create_content_preview(content: str, max_length: int = 150) -> str:
    """Create a preview of content"""
    if len(content) <= max_length:
        return content
    return content[:max_length].rsplit(' ', 1)[0] + '...'
