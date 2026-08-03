"""
Storage service — high-level API used by route handlers.

Wraps the provider abstraction with:
    - File validation
    - Image processing
    - UUID filename generation
    - Transaction-safe upload tracking with rollback
    - Automatic old-file cleanup on replace/delete

Usage:
    from app.services.storage import get_storage_service

    storage = get_storage_service()
    url = storage.upload_image(file, "blogs")
"""
import logging
import os
import uuid
from typing import Optional

from fastapi import UploadFile

from app.core.config import settings
from app.services.storage.base import StorageProvider
from app.services.storage.processor import process_image
from app.services.storage.validator import (
    sanitize_filename,
    validate_file,
    validate_image,
)

logger = logging.getLogger(__name__)

# ── Module-level singleton ────────────────────────────────────
_storage_service: Optional["StorageService"] = None


class StorageService:
    """
    High-level storage service used by route handlers.

    Delegates to whichever StorageProvider is configured via STORAGE_PROVIDER env var.
    Provides upload/delete/replace methods with validation and image processing built in.
    """

    def __init__(self, provider: StorageProvider) -> None:
        self.provider = provider
        self._pending_uploads: list[str] = []  # Keys uploaded in current request

    # ── Image Uploads ─────────────────────────────────────────

    def upload_image(self, file: UploadFile, subfolder: str) -> str:
        """
        Validate, process, and upload a single image.

        Steps:
            1. Validate (extension, magic bytes, size)
            2. Process (resize, convert to WebP)
            3. Generate UUID filename
            4. Upload via provider
            5. Return public URL

        Args:
            file: FastAPI UploadFile from multipart form.
            subfolder: Storage subfolder (e.g. "blogs", "projects").

        Returns:
            Public URL string.
        """
        file_bytes = validate_image(file)
        filename = sanitize_filename(file.filename or "image.png")

        # Process image (resize + WebP conversion)
        processed_bytes, processed_filename = process_image(file_bytes, filename)

        # Generate collision-proof key
        key = self._make_key(subfolder, processed_filename)

        # Upload and track
        self.provider.upload(processed_bytes, key)
        self._pending_uploads.append(key)

        url = self.provider.get_public_url(key)
        logger.info("Image uploaded: %s → %s", filename, url)
        return url

    def upload_images(self, files: list[UploadFile], subfolder: str) -> list[str]:
        """
        Upload multiple images (e.g. gallery).

        Args:
            files: List of UploadFile objects.
            subfolder: Storage subfolder.

        Returns:
            List of public URL strings.
        """
        urls: list[str] = []
        for f in files:
            # Skip empty file entries (Swagger UI sends empty files sometimes)
            if not f.filename or f.size == 0:
                continue
            url = self.upload_image(f, subfolder)
            urls.append(url)
        return urls

    # ── Document Uploads ──────────────────────────────────────

    def upload_file(self, file: UploadFile, subfolder: str) -> tuple[str, str]:
        """
        Validate and upload a document/resource file (PDF, DOC, etc.).

        Args:
            file: FastAPI UploadFile.
            subfolder: Storage subfolder (e.g. "resources").

        Returns:
            Tuple of (public_url, original_filename).
        """
        file_bytes = validate_file(file)
        filename = sanitize_filename(file.filename or "document.pdf")

        key = self._make_key(subfolder, filename)

        self.provider.upload(file_bytes, key)
        self._pending_uploads.append(key)

        url = self.provider.get_public_url(key)
        logger.info("File uploaded: %s → %s", filename, url)
        return url, filename

    # ── Deletion ──────────────────────────────────────────────

    def delete_file(self, url: str | None) -> None:
        """
        Delete a file from storage by its public URL.

        Silently skips if URL is None or empty.

        Args:
            url: Public URL previously returned by upload methods.
        """
        if not url:
            return

        key = self._url_to_key(url)
        if key:
            self.provider.delete(key)
            logger.info("File deleted: %s", url)

    def delete_files(self, urls: list[str] | None) -> None:
        """Delete multiple files (e.g. gallery cleanup)."""
        if not urls:
            return
        for url in urls:
            self.delete_file(url)

    # ── Replace (update flow) ─────────────────────────────────

    def replace_image(
        self, old_url: str | None, new_file: UploadFile, subfolder: str
    ) -> str:
        """
        Upload a new image and delete the old one.

        Args:
            old_url: URL of the existing image (will be deleted).
            new_file: New UploadFile to upload.
            subfolder: Storage subfolder.

        Returns:
            New public URL.
        """
        new_url = self.upload_image(new_file, subfolder)
        self.delete_file(old_url)
        return new_url

    def replace_file(
        self, old_url: str | None, new_file: UploadFile, subfolder: str
    ) -> tuple[str, str]:
        """
        Upload a new document and delete the old one.

        Returns:
            Tuple of (new_url, original_filename).
        """
        new_url, filename = self.upload_file(new_file, subfolder)
        self.delete_file(old_url)
        return new_url, filename

    # ── Transaction Safety ────────────────────────────────────

    def rollback_uploads(self) -> None:
        """
        Delete all files uploaded during the current request.

        Call this when the database transaction fails after files
        have already been written to storage.
        """
        if not self._pending_uploads:
            return

        logger.warning("Rolling back %d uploaded files", len(self._pending_uploads))
        for key in self._pending_uploads:
            try:
                self.provider.delete(key)
            except Exception as e:
                logger.error("Rollback failed for key %s: %s", key, e)

        self._pending_uploads.clear()

    def clear_pending(self) -> None:
        """
        Clear the pending uploads list after a successful DB commit.

        Call this when the transaction succeeds so rollback won't
        delete the files that were intentionally saved.
        """
        self._pending_uploads.clear()

    # ── Internal Helpers ──────────────────────────────────────

    @staticmethod
    def _make_key(subfolder: str, filename: str) -> str:
        """
        Generate a collision-proof storage key.

        Format: {subfolder}/{uuid8}_{sanitized_filename}
        Example: blogs/a1b2c3d4_my-image.webp
        """
        uid = uuid.uuid4().hex[:8]
        return f"{subfolder}/{uid}_{filename}"

    def _url_to_key(self, url: str) -> str | None:
        """
        Extract storage key from a public URL.

        Handles both local (/media/blogs/xxx.webp) and S3 URLs.
        """
        if not url:
            return None

        # Local URL: strip the media prefix
        media_prefix = settings.MEDIA_URL.rstrip("/") + "/"
        if url.startswith(media_prefix):
            return url[len(media_prefix):]

        # S3 URL: extract everything after the bucket name
        if settings.AWS_BUCKET_NAME and settings.AWS_BUCKET_NAME in url:
            # Handle both endpoint-style and virtual-hosted URLs
            parts = url.split(settings.AWS_BUCKET_NAME + "/", 1)
            if len(parts) == 2:
                return parts[1]

        # Fallback: try to find a known subfolder pattern
        for subfolder in ("blogs", "news", "insights", "projects", "case-studies", "resources"):
            if f"{subfolder}/" in url:
                idx = url.index(f"{subfolder}/")
                return url[idx:]

        logger.warning("Could not extract key from URL: %s", url)
        return None


def get_storage_service() -> StorageService:
    """
    Get or create the singleton StorageService instance.

    The provider is selected based on the STORAGE_PROVIDER setting.
    """
    global _storage_service

    if _storage_service is not None:
        return _storage_service

    provider_name = settings.STORAGE_PROVIDER.lower()

    if provider_name == "local":
        from app.services.storage.local import LocalStorageProvider
        provider = LocalStorageProvider()

    elif provider_name == "s3":
        from app.services.storage.s3 import S3StorageProvider
        provider = S3StorageProvider()

    else:
        raise ValueError(
            f"Unknown STORAGE_PROVIDER: '{provider_name}'. "
            "Must be 'local' or 's3'."
        )

    logger.info("Storage provider initialised: %s", provider_name)
    _storage_service = StorageService(provider)
    return _storage_service
