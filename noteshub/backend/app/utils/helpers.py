import re
from typing import List
from bson import ObjectId


def html_to_plain_text(html: str) -> str:
    """Strip HTML tags for search indexing and plain previews."""
    if not html:
        return ""
    text = re.sub(r"<script[^>]*>[\s\S]*?</script>", " ", html, flags=re.IGNORECASE)
    text = re.sub(r"<style[^>]*>[\s\S]*?</style>", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


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
    """Create a preview of content (strips HTML when present)."""
    plain = html_to_plain_text(content) if content and "<" in content else (content or "")
    if len(plain) <= max_length:
        return plain
    return plain[:max_length].rsplit(" ", 1)[0] + "..."
