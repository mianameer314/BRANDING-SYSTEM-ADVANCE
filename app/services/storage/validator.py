"""
File validation — extension checks, magic-byte verification, size limits, virus scan hook.

Validates uploads server-side. Never trusts UploadFile.content_type alone.
"""
import logging
import os
from pathlib import PurePosixPath

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings
from app.services.storage.constants import (
    ALLOWED_FILE_EXTENSIONS,
    ALLOWED_FILE_MIMES,
    ALLOWED_IMAGE_EXTENSIONS,
    ALLOWED_IMAGE_MIMES,
    BLOCKED_EXTENSIONS,
)

logger = logging.getLogger(__name__)


def sanitize_filename(name: str) -> str:
    """
    Strip path traversal characters and dangerous patterns from a filename.

    - Extracts basename only (no directory components)
    - Removes null bytes
    - Replaces spaces with underscores
    - Strips leading dots
    """
    # Take only the filename, no directory
    name = PurePosixPath(name).name
    name = os.path.basename(name)

    # Remove null bytes and control characters
    name = name.replace("\x00", "").replace("\r", "").replace("\n", "")

    # Replace spaces
    name = name.replace(" ", "_")

    # Strip leading dots (hidden files)
    name = name.lstrip(".")

    # Fallback for empty names
    if not name:
        name = "upload"

    return name


def _get_extension(filename: str) -> str:
    """Extract lowercase file extension including the dot."""
    _, ext = os.path.splitext(filename)
    return ext.lower()


def _check_blocked(filename: str) -> None:
    """Reject any file with a blocked (executable) extension."""
    ext = _get_extension(filename)
    if ext in BLOCKED_EXTENSIONS:
        logger.warning("Blocked extension upload attempt: %s", filename)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{ext}' is not allowed.",
        )


def _check_size(file_bytes: bytes, max_mb: int, label: str) -> None:
    """Reject files that exceed the configured size limit."""
    max_bytes = max_mb * 1024 * 1024
    if len(file_bytes) > max_bytes:
        logger.warning("Oversized %s upload: %d bytes (limit %d MB)", label, len(file_bytes), max_mb)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds the {max_mb} MB limit for {label}.",
        )


def _check_magic_bytes(file_bytes: bytes, allowed_mimes: set[str], label: str) -> str:
    """
    Verify file content using magic-byte detection via the `filetype` library.

    Returns:
        Detected MIME type string.

    Raises:
        HTTPException 400 if the file type cannot be detected or is not allowed.
    """
    try:
        import filetype
    except ImportError:
        logger.error("filetype library not installed — skipping magic-byte validation")
        return "application/octet-stream"

    kind = filetype.guess(file_bytes)

    if kind is None:
        logger.warning("Could not detect file type via magic bytes for %s upload", label)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not determine file type. Upload a valid file.",
        )

    if kind.mime not in allowed_mimes:
        logger.warning(
            "Magic-byte mismatch for %s: detected %s, allowed %s",
            label, kind.mime, allowed_mimes,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File content type '{kind.mime}' is not allowed for {label}.",
        )

    return kind.mime


def scan_file(file_bytes: bytes) -> bool:
    """
    Placeholder hook for future virus scanning (e.g. ClamAV).

    Currently always returns True (clean).
    When ClamAV is integrated, this function should:
        1. Connect to clamd socket
        2. Stream file_bytes for scanning
        3. Return False and raise HTTPException if malware detected

    Returns:
        True if file is considered clean.
    """
    # TODO: Integrate ClamAV via pyclamd when ready
    return True


def validate_image(file: UploadFile) -> bytes:
    """
    Full validation pipeline for image uploads.

    1. Sanitize filename
    2. Check blocked extensions
    3. Check allowed image extension
    4. Read and check file size
    5. Verify magic bytes
    6. Run virus scan hook

    Returns:
        Raw file bytes (already read).

    Raises:
        HTTPException 400 on any validation failure.
    """
    filename = sanitize_filename(file.filename or "image")
    _check_blocked(filename)

    ext = _get_extension(filename)
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image extension '{ext}' is not allowed. Allowed: {', '.join(sorted(ALLOWED_IMAGE_EXTENSIONS))}",
        )

    file_bytes = file.file.read()
    file.file.seek(0)  # Reset for potential re-read

    _check_size(file_bytes, settings.MAX_IMAGE_SIZE_MB, "images")
    _check_magic_bytes(file_bytes, ALLOWED_IMAGE_MIMES, "images")

    if not scan_file(file_bytes):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File failed security scan.",
        )

    logger.info("Image validated: %s (%d bytes)", filename, len(file_bytes))
    return file_bytes


def validate_file(file: UploadFile) -> bytes:
    """
    Full validation pipeline for document/resource uploads (PDF, DOC, etc.).

    Same steps as validate_image but with document-specific rules.

    Returns:
        Raw file bytes (already read).

    Raises:
        HTTPException 400 on any validation failure.
    """
    filename = sanitize_filename(file.filename or "document")
    _check_blocked(filename)

    ext = _get_extension(filename)
    if ext not in ALLOWED_FILE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension '{ext}' is not allowed. Allowed: {', '.join(sorted(ALLOWED_FILE_EXTENSIONS))}",
        )

    file_bytes = file.file.read()
    file.file.seek(0)

    _check_size(file_bytes, settings.MAX_FILE_SIZE_MB, "documents")
    _check_magic_bytes(file_bytes, ALLOWED_FILE_MIMES, "documents")

    if not scan_file(file_bytes):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File failed security scan.",
        )

    logger.info("Document validated: %s (%d bytes)", filename, len(file_bytes))
    return file_bytes
