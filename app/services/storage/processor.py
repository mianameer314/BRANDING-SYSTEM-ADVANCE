"""
Image processor — resize, optimise, and convert images to WebP before storage.

Uses Pillow for all image operations.
"""
import io
import logging
import os

from PIL import Image

from app.core.config import settings

logger = logging.getLogger(__name__)


def process_image(file_bytes: bytes, filename: str) -> tuple[bytes, str]:
    """
    Process an image before saving to storage.

    Steps:
        1. Open image with Pillow
        2. If width exceeds IMAGE_MAX_WIDTH, resize preserving aspect ratio
        3. If JPEG or PNG, convert to WebP (quality 85)
        4. If GIF, skip conversion (preserve animation)
        5. If already WebP, optimise quality only

    Args:
        file_bytes: Raw image bytes (already validated).
        filename: Original sanitized filename.

    Returns:
        Tuple of (processed_bytes, new_filename_with_correct_extension).
    """
    name, ext = os.path.splitext(filename)
    ext = ext.lower()

    # GIF: skip processing to preserve animation frames
    if ext == ".gif":
        logger.info("GIF detected — skipping processing for %s", filename)
        return file_bytes, filename

    try:
        img = Image.open(io.BytesIO(file_bytes))
    except Exception as e:
        logger.warning("Failed to open image with Pillow: %s — returning raw bytes", e)
        return file_bytes, filename

    # ── Resize if too wide ────────────────────────────────────
    max_width = settings.IMAGE_MAX_WIDTH

    if img.width > max_width:
        ratio = max_width / img.width
        new_height = int(img.height * ratio)
        img = img.resize((max_width, new_height), Image.LANCZOS)
        logger.info(
            "Resized %s: %dx%d → %dx%d",
            filename, img.width, img.height, max_width, new_height,
        )

    # ── Convert to WebP ───────────────────────────────────────
    output = io.BytesIO()

    # Convert RGBA/palette to RGB for WebP compatibility
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        img = img.convert("RGBA")
        img.save(output, format="WEBP", quality=85, method=4)
    else:
        img = img.convert("RGB")
        img.save(output, format="WEBP", quality=85, method=4)

    processed_bytes = output.getvalue()
    new_filename = f"{name}.webp"

    logger.info(
        "Processed %s → %s (%d → %d bytes, %.0f%% reduction)",
        filename, new_filename,
        len(file_bytes), len(processed_bytes),
        (1 - len(processed_bytes) / max(len(file_bytes), 1)) * 100,
    )

    return processed_bytes, new_filename
