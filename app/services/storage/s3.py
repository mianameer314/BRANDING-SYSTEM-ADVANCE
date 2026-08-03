"""
AWS S3 storage provider.

Uses boto3 to upload, delete, and generate public URLs for files in an S3 bucket.
"""
import logging

import boto3
from botocore.exceptions import ClientError

from app.core.config import settings
from app.services.storage.base import StorageProvider

logger = logging.getLogger(__name__)


class S3StorageProvider(StorageProvider):
    """
    Store files in an AWS S3 bucket.

    Bucket structure mirrors local storage:
        blogs/
        news/
        insights/
        projects/
        case-studies/
        resources/

    Public URLs:
        https://{bucket}.s3.{region}.amazonaws.com/{key}
        or via custom endpoint URL.
    """

    def __init__(self) -> None:
        self.bucket = settings.AWS_BUCKET_NAME
        self.region = settings.AWS_REGION

        # Build client kwargs
        client_kwargs: dict = {
            "region_name": self.region,
            "aws_access_key_id": settings.AWS_ACCESS_KEY_ID,
            "aws_secret_access_key": settings.AWS_SECRET_ACCESS_KEY,
        }

        # Support custom endpoint (e.g. MinIO, DigitalOcean Spaces)
        if settings.AWS_ENDPOINT_URL:
            client_kwargs["endpoint_url"] = settings.AWS_ENDPOINT_URL

        self.client = boto3.client("s3", **client_kwargs)

        logger.info(
            "S3StorageProvider initialised — bucket: %s, region: %s",
            self.bucket, self.region,
        )

    def upload(self, file_bytes: bytes, key: str) -> str:
        """
        Upload file bytes to S3.

        Args:
            file_bytes: Raw file content.
            key: Object key (e.g. "blogs/uuid_image.webp").

        Returns:
            The stored key.
        """
        # Determine content type from extension
        content_type = self._guess_content_type(key)

        self.client.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=file_bytes,
            ContentType=content_type,
        )

        logger.info("Uploaded to S3: s3://%s/%s (%d bytes)", self.bucket, key, len(file_bytes))
        return key

    def delete(self, key: str) -> bool:
        """
        Delete a file from S3.

        Args:
            key: Object key.

        Returns:
            True if deletion request succeeded (S3 returns 204 even for non-existent keys).
        """
        try:
            self.client.delete_object(Bucket=self.bucket, Key=key)
            logger.info("Deleted from S3: s3://%s/%s", self.bucket, key)
            return True
        except ClientError as e:
            logger.error("S3 delete failed for %s: %s", key, e)
            return False

    def get_public_url(self, key: str) -> str:
        """
        Generate a public URL for the S3 object.

        Uses custom endpoint if configured, otherwise standard S3 URL format.
        """
        if settings.AWS_ENDPOINT_URL:
            base = settings.AWS_ENDPOINT_URL.rstrip("/")
            return f"{base}/{self.bucket}/{key}"

        return f"https://{self.bucket}.s3.{self.region}.amazonaws.com/{key}"

    def exists(self, key: str) -> bool:
        """Check if the object exists in S3."""
        try:
            self.client.head_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError:
            return False

    @staticmethod
    def _guess_content_type(key: str) -> str:
        """Guess MIME type from file extension for the S3 ContentType header."""
        ext = key.rsplit(".", 1)[-1].lower() if "." in key else ""
        mime_map = {
            "webp": "image/webp",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "png": "image/png",
            "gif": "image/gif",
            "pdf": "application/pdf",
            "doc": "application/msword",
            "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        }
        return mime_map.get(ext, "application/octet-stream")
