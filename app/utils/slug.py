"""
Slug utilities — URL-safe slug generation with DB uniqueness handling.
"""
import re

from sqlalchemy.orm import Session


def generate_slug(text: str) -> str:
    """
    Convert arbitrary text into a URL-safe slug.

    Examples:
        "My First Blog Post!" → "my-first-blog-post"
        "O2geeks — Branding Update (v2)" → "o2geeks-branding-update-v2"
    """
    # Lowercase and strip whitespace
    slug = text.lower().strip()
    # Replace any non-alphanumeric character (except hyphens) with a hyphen
    slug = re.sub(r"[^a-z0-9\-]", "-", slug)
    # Collapse consecutive hyphens
    slug = re.sub(r"-+", "-", slug)
    # Remove leading/trailing hyphens
    slug = slug.strip("-")
    return slug


def ensure_unique_slug(db: Session, model, slug: str, exclude_id: int | None = None) -> str:
    """
    Check the database for slug collisions and append a numeric suffix
    (-2, -3, ...) until a unique slug is found.

    Args:
        db: Active SQLAlchemy session
        model: The SQLAlchemy model class (must have a `.slug` column)
        slug: The candidate slug to check
        exclude_id: Optional ID to exclude from collision checks (e.g. self)

    Returns:
        A slug guaranteed to be unique within the model's table.
    """
    original_slug = slug
    counter = 2

    def slug_exists(current_slug: str) -> bool:
        query = db.query(model.id).filter(model.slug == current_slug)
        if exclude_id is not None:
            query = query.filter(model.id != exclude_id)
        return query.first() is not None

    while slug_exists(slug):
        slug = f"{original_slug}-{counter}"
        counter += 1

    return slug
