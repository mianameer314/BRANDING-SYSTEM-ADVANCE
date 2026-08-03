"""
Storage constants — allowed file types, blocked extensions, MIME mappings.
Centralised here to avoid duplication across validator and processor.
"""

# ── Image Types ──────────────────────────────────────────────────
ALLOWED_IMAGE_EXTENSIONS: set[str] = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

ALLOWED_IMAGE_MIMES: set[str] = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}

# ── Document / Resource Types ────────────────────────────────────
ALLOWED_FILE_EXTENSIONS: set[str] = {
    ".pdf",
    ".doc",
    ".docx",
    ".xlsx",
    ".pptx",
}

ALLOWED_FILE_MIMES: set[str] = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
}

# ── Combined (for the resource endpoint which accepts both) ──────
ALL_ALLOWED_EXTENSIONS: set[str] = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_FILE_EXTENSIONS
ALL_ALLOWED_MIMES: set[str] = ALLOWED_IMAGE_MIMES | ALLOWED_FILE_MIMES

# ── Blocked Extensions (executable / dangerous) ─────────────────
BLOCKED_EXTENSIONS: set[str] = {
    ".exe", ".bat", ".cmd", ".sh", ".ps1",
    ".js", ".php", ".py", ".rb", ".pl",
    ".com", ".msi", ".scr", ".vbs", ".wsf",
    ".jar", ".war",
}

# ── Content-type subfolder mapping ───────────────────────────────
CONTENT_SUBFOLDERS: dict[str, str] = {
    "blog": "blogs",
    "news": "news",
    "insight": "insights",
    "project": "projects",
    "case_study": "case-studies",
    "resource": "resources",
}
