"""
Resource service.
"""

from sqlalchemy.orm import Session

from app.models.resource import Resource
from app.schemas.resource import ResourceCreate, ResourceUpdate
from app.services.content_validator import validate_content_exists
from app.services.revision_history import record_audit_event


def create_resource(
    db: Session,
    data: ResourceCreate,
    *,
    actor_id: int | None = None,
) -> Resource:
    """
    Create a downloadable resource.

    Raises:
        HTTPException: If the content type is invalid or the referenced content does not exist.
    """

    # Ensure parent content exists
    validate_content_exists(
        db=db,
        content_type=data.content_type,
        content_id=data.content_id,
    )

    resource = Resource(**data.model_dump())

    db.add(resource)
    db.flush()
    record_audit_event(
        db, event_type="media.created", subject_type="resource", subject_id=resource.id,
        actor_id=actor_id, details={"content_type": data.content_type, "content_id": data.content_id, "file_name": data.file_name},
    )
    db.commit()
    db.refresh(resource)

    return resource


def get_resource(
    db: Session,
    resource_id: int,
) -> Resource | None:
    """
    Get a resource by its ID.
    """

    return (
        db.query(Resource)
        .filter(Resource.id == resource_id)
        .first()
    )


def update_resource(
    db: Session,
    resource_id: int,
    data: ResourceUpdate,
    *,
    actor_id: int | None = None,
) -> Resource | None:
    """
    Update a resource.
    """

    resource = get_resource(db, resource_id)

    if resource is None:
        return None

    update_data = data.model_dump(exclude_unset=True)

    # If the parent content changes, validate it
    new_content_type = update_data.get(
        "content_type",
        resource.content_type,
    )

    new_content_id = update_data.get(
        "content_id",
        resource.content_id,
    )

    validate_content_exists(
        db=db,
        content_type=new_content_type,
        content_id=new_content_id,
    )

    for field, value in update_data.items():
        setattr(resource, field, value)

    record_audit_event(
        db, event_type="media.updated", subject_type="resource", subject_id=resource.id,
        actor_id=actor_id, details={"changed_fields": sorted(update_data)},
    )
    db.commit()
    db.refresh(resource)

    return resource


def delete_resource(
    db: Session,
    resource_id: int,
    *,
    actor_id: int | None = None,
) -> bool:
    """
    Delete a resource.
    """

    resource = get_resource(db, resource_id)

    if resource is None:
        return False

    record_audit_event(
        db, event_type="media.deleted", subject_type="resource", subject_id=resource.id,
        actor_id=actor_id, details={"content_type": resource.content_type, "content_id": resource.content_id, "file_name": resource.file_name},
    )
    db.delete(resource)
    db.commit()

    return True


def list_resources(
    db: Session,
    content_type: str,
    content_id: int,
) -> list[Resource]:
    """
    List resources for a content item.
    """

    validate_content_exists(
        db=db,
        content_type=content_type,
        content_id=content_id,
    )

    return (
        db.query(Resource)
        .filter(
            Resource.content_type == content_type,
            Resource.content_id == content_id,
        )
        .all()
    )


def create_resource_from_upload(
    db: Session,
    *,
    content_type: str,
    content_id: int,
    file_url: str,
    file_name: str,
    actor_id: int | None = None,
) -> Resource:
    """
    Create a resource from a file upload.

    Called by the route handler after the file has already been uploaded
    to storage. The URL and filename are passed directly.

    Raises:
        HTTPException: If the parent content does not exist.
    """
    validate_content_exists(db=db, content_type=content_type, content_id=content_id)

    resource = Resource(
        content_type=content_type,
        content_id=content_id,
        file_url=file_url,
        file_name=file_name,
    )

    db.add(resource)
    db.flush()
    record_audit_event(
        db, event_type="media.created", subject_type="resource", subject_id=resource.id,
        actor_id=actor_id, details={"content_type": content_type, "content_id": content_id, "file_name": file_name},
    )
    db.commit()
    db.refresh(resource)

    return resource


def update_resource_file(
    db: Session,
    resource_id: int,
    *,
    file_url: str,
    file_name: str,
    actor_id: int | None = None,
) -> Resource | None:
    """
    Update only the file_url and file_name of a resource.

    Called by the route handler after a replacement file has been uploaded.
    """
    resource = get_resource(db, resource_id)

    if resource is None:
        return None

    resource.file_url = file_url
    resource.file_name = file_name

    record_audit_event(
        db, event_type="media.replaced", subject_type="resource", subject_id=resource.id,
        actor_id=actor_id, details={"file_name": file_name},
    )
    db.commit()
    db.refresh(resource)

    return resource
