import subprocess
import os
from io import BytesIO
from PIL import Image
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage


def convert_to_webp(image_file):
    img = Image.open(image_file)
    img = img.convert("RGB")
    buf = BytesIO()
    img.save(buf, format="WEBP", quality=85)
    return buf.getvalue()


def convert_to_mp4(input_path, output_path=None, timeout=120):
    """Convert GIF/WebM to MP4 using FFmpeg. Returns output path."""
    if output_path is None:
        output_path = f"{os.path.splitext(input_path)[0]}_converted.mp4"
    subprocess.run(
        ["ffmpeg", "-y", "-i", input_path,
         "-c:v", "libx264", "-preset", "fast",
         "-crf", "23", "-pix_fmt", "yuv420p",
         output_path],
        check=True, capture_output=True, timeout=timeout,
    )
    return output_path


def save_upload_as_webp(uploaded_file, subdir="items"):
    """Save an uploaded image as WebP and return the path."""
    webp_bytes = convert_to_webp(uploaded_file)
    name = f"{os.path.splitext(uploaded_file.name)[0]}.webp"
    path = default_storage.save(f"{subdir}/{name}", ContentFile(webp_bytes))
    return path
