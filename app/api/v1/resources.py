"""
Resource routes — Admin management and user downloads.
Create accepts multipart file upload for PDFs/documents.
"""
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.api.deps import DbDep
from app.core.permissions import require_permission
from app.models.user import User
from app.schemas.resource import ResourceOut
from app.services import resource as resource_service
from app.services.storage import get_storage_service
from app.rate_limit import PUBLIC_GET_LIMIT, AUTH_GET_LIMIT, UPLOAD_LIMIT, CONTENT_DELETE_LIMIT

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/resources", tags=["Resources"])

AdminDep = Annotated[User, Depends(require_permission("create"))]
InteractDep = Annotated[User, Depends(require_permission("interact"))]


@router.post("", response_model=ResourceOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(UPLOAD_LIMIT)])
def create_resource(
    db: DbDep,
    admin: AdminDep,
    content_type: str = Form(..., description="Content type (blog, news, project, etc.)"),
    content_id: int = Form(..., description="ID of the parent content"),
    file: UploadFile = File(..., description="File to upload (PDF/DOC/DOCX/XLSX/PPTX, max 20MB)"),
):
    """
    Upload and attach a downloadable resource to content (Admin/Editor).

    - File is saved to storage and URL + filename stored in DB
    - Validates file type and size
    """
    storage = get_storage_service()

    try:
        file_url, file_name = storage.upload_file(file, "resources")

        resource = resource_service.create_resource_from_upload(
            db,
            content_type=content_type,
            content_id=content_id,
            file_url=file_url,
            file_name=file_name,
            actor_id=admin.id,
        )

        storage.clear_pending()
        return resource

    except HTTPException:
        storage.rollback_uploads()
        raise
    except Exception as e:
        storage.rollback_uploads()
        logger.error("Resource creation failed: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.get("/content/{content_type}/{content_id}", response_model=list[ResourceOut], dependencies=[Depends(PUBLIC_GET_LIMIT)])
def list_content_resources(content_type: str, content_id: int, db: DbDep):
    """List resources attached to content. Public to see *what* is available, but download is gated."""
    return resource_service.list_resources(db, content_type, content_id)


@router.get("/{resource_id}/download", dependencies=[Depends(AUTH_GET_LIMIT)])
def download_resource(resource_id: int, db: DbDep, user: InteractDep):
    """
    Get the download URL for a resource.
    Gated behind 'interact' permission (logged-in users).
    """
    resource = resource_service.get_resource(db, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    return {"download_url": resource.file_url, "file_name": resource.file_name}


@router.put("/{resource_id}", response_model=ResourceOut, dependencies=[Depends(UPLOAD_LIMIT)])
def update_resource(
    resource_id: int,
    db: DbDep,
    admin: AdminDep,
    file: UploadFile | None = File(None, description="New file (replaces existing)"),
):
    """
    Replace the file for an existing resource (Admin/Editor).

    - Old file is deleted from storage
    - New file is uploaded and URL updated in DB
    """
    storage = get_storage_service()

    existing = resource_service.get_resource(db, resource_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Resource not found")

    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    try:
        new_url, new_name = storage.replace_file(existing.file_url, file, "resources")

        resource = resource_service.update_resource_file(
            db, resource_id, file_url=new_url, file_name=new_name, actor_id=admin.id
        )

        storage.clear_pending()
        return resource

    except HTTPException:
        storage.rollback_uploads()
        raise
    except Exception as e:
        storage.rollback_uploads()
        logger.error("Resource update failed: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(CONTENT_DELETE_LIMIT)])
def delete_resource(resource_id: int, db: DbDep, admin: AdminDep):
    """
    Delete a resource (Admin/Editor).

    - Also deletes the file from storage
    """
    storage = get_storage_service()

    resource = resource_service.get_resource(db, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    old_url = resource.file_url
    deleted = resource_service.delete_resource(db, resource_id, actor_id=admin.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Resource not found")

    storage.delete_file(old_url)
