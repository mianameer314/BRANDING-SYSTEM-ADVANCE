"""
Storage package — provides a provider-agnostic file storage service.

Usage:
    from app.services.storage import get_storage_service

    storage = get_storage_service()
    url = storage.upload_image(upload_file, subfolder="blogs")
"""
from app.services.storage.service import get_storage_service

__all__ = ["get_storage_service"]
