"""
Abstract base class for storage providers.

Every provider (Local, S3, etc.) must implement this interface.
Business logic and route handlers interact ONLY through this contract.
"""
from abc import ABC, abstractmethod


class StorageProvider(ABC):
    """Abstract interface for file storage backends."""

    @abstractmethod
    def upload(self, file_bytes: bytes, key: str) -> str:
        """
        Save file bytes to storage.

        Args:
            file_bytes: Raw file content.
            key: Storage key / path (e.g. "blogs/uuid_image.webp").

        Returns:
            The stored key (same as input key for most providers).
        """

    @abstractmethod
    def delete(self, key: str) -> bool:
        """
        Remove a file from storage.

        Args:
            key: Storage key / path.

        Returns:
            True if deleted successfully, False if file did not exist.
        """

    @abstractmethod
    def get_public_url(self, key: str) -> str:
        """
        Generate a publicly-accessible URL for the stored file.

        Args:
            key: Storage key / path.

        Returns:
            Full URL string.
        """

    @abstractmethod
    def exists(self, key: str) -> bool:
        """
        Check whether a file exists in storage.

        Args:
            key: Storage key / path.

        Returns:
            True if the file exists.
        """
