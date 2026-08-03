"""
Utility functions for parsing form data.
"""

def parse_optional_string(value: str | None) -> str | None:
    """
    Parses a string field from a multipart form.
    - If the client sends the literal string "null", it is treated as a request to set the field to NULL.
    - Otherwise, the value is returned as-is (including "" for empty strings).
    """
    if value == "null":
        return None
    return value
