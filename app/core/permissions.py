"""
Role-Based Access Control (RBAC) permissions matrix and dependency guards.
"""
from enum import Enum
from fastapi import Depends, HTTPException, status
# Note: get_current_user is imported dynamically inside the dependency factory 
# to avoid circular imports, as deps.py imports from here.

class UserRole(str, Enum):
    super_admin = "super_admin"
    admin = "admin"
    editor = "editor"
    user = "user"
    viewer = "viewer"

ROLE_PERMISSIONS = {
    "super_admin": {"read_content", "create", "update", "delete", "approve", "publish", "interact", "manage_users", "view_drafts", "manage_webhooks"},
    "admin":       {"read_content", "create", "update", "delete", "approve", "publish", "interact", "view_drafts", "manage_webhooks"},
    "editor":      {"read_content", "create", "update", "interact", "view_drafts"},
    "user":        {"read_content", "interact"},
    "viewer":      {"read_content"},
}

STATUS_PERMISSION_REQUIREMENTS = {
    "changes_requested": "approve",
    "approved": "approve",
    "scheduled": "publish",
    "published": "publish",
    "unpublished": "publish",
    "archived": "publish",
}

LOCKED_STATUS_REQUIREMENTS = {
    "approved": "approve",
    "scheduled": "publish",
    "published": "publish",
    "unpublished": "publish",
    "archived": "publish",
}

def require_permission(permission: str):
    """
    FastAPI dependency factory that checks if the current user has a specific permission.
    """
    # Import locally to avoid circular dependency with app.api.deps
    from app.api.deps import get_current_user
    from app.models.user import User

    def checker(user: User = Depends(get_current_user)) -> User:
        user_perms = ROLE_PERMISSIONS.get(user.role, set())
        if permission not in user_perms:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission}' required"
            )
        return user

    return checker


def enforce_publish_permission(user, target_status) -> None:
    """
    Verifies privileged editorial-state changes.
    Raises HTTP 403 Forbidden if the user lacks the permission.
    """
    if target_status is None:
        return
        
    status_val = target_status.value if hasattr(target_status, "value") else target_status
    required_permission = STATUS_PERMISSION_REQUIREMENTS.get(status_val)
    if required_permission:
        user_perms = ROLE_PERMISSIONS.get(user.role, set())
        if required_permission not in user_perms:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You do not have permission to move content to '{status_val}'."
            )

def enforce_content_lock(user, current_status) -> None:
    """
    Verifies if the user is authorized to modify content in its current privileged status.
    Raises HTTP 403 Forbidden if the user lacks the permission for the current status.
    """
    if current_status is None:
        return
        
    status_val = current_status.value if hasattr(current_status, "value") else current_status
    required_permission = LOCKED_STATUS_REQUIREMENTS.get(status_val)
    if required_permission:
        user_perms = ROLE_PERMISSIONS.get(user.role, set())
        if required_permission not in user_perms:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Content is locked in '{status_val}' status. You do not have permission to modify it."
            )


def can_view_drafts(user) -> bool:
    """
    Returns True if the user is authenticated and their role has the "view_drafts" permission.
    """
    if not user:
        return False
        
    user_perms = ROLE_PERMISSIONS.get(user.role, set())
    return "view_drafts" in user_perms
