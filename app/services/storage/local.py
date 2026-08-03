"""
Local filesystem storage provider.

Saves files to a configurable directory and serves them via FastAPI's StaticFiles mount.
"""
import logging
import os
from pathlib import Path

from app.core.config import settings
from app.services.storage.base import StorageProvider

logger = logging.getLogger(__name__)


class LocalStorageProvider(StorageProvider):
    """
    Store files on the local filesystem.

    Directory structure:
        {LOCAL_STORAGE_PATH}/
        ├── blogs/
        ├── news/
        ├── insights/
        ├── projects/
        ├── case-studies/
        └── resources/

    Public URLs:
        {MEDIA_URL}/blogs/uuid_filename.webp
    """

    def __init__(self) -> None:
        self.root = Path(settings.LOCAL_STORAGE_PATH)
        self.media_url = settings.MEDIA_URL.rstrip("/")

        # Ensure root directory exists
        self.root.mkdir(parents=True, exist_ok=True)
        logger.info("LocalStorageProvider initialised — root: %s", self.root.resolve())

    def upload(self, file_bytes: bytes, key: str) -> str:
        """
        Save file bytes to disk.

        Args:
            file_bytes: Raw file content.
            key: Relative path (e.g. "blogs/uuid_image.webp").

        Returns:
            The stored key.
        """
        file_path = self.root / key

        # Ensure subfolder exists
        file_path.parent.mkdir(parents=True, exist_ok=True)

        file_path.write_bytes(file_bytes)
        logger.info("Uploaded to local storage: %s (%d bytes)", file_path, len(file_bytes))

        return key

    def delete(self, key: str) -> bool:
        """
        Remove a file from disk.

        Args:
            key: Relative path.

        Returns:
            True if file was deleted, False if it didn't exist.
        """
        file_path = self.root / key

        if file_path.is_file():
            file_path.unlink()
            logger.info("Deleted from local storage: %s", file_path)
            return True

        logger.warning("File not found for deletion: %s", file_path)
        return False

    def get_public_url(self, key: str) -> str:
        """
        Generate a URL that FastAPI's StaticFiles mount will serve.

        Args:
            key: Relative path (e.g. "blogs/uuid_image.webp").

        Returns:
            URL string (e.g. "/media/blogs/uuid_image.webp").
        """
        return f"{self.media_url}/{key}"

    def exists(self, key: str) -> bool:
        """Check if the file exists on disk."""
        return (self.root / key).is_file()
