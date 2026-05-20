import subprocess
import os
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files import File
from django.core.files.storage import default_storage
from PIL import Image
from io import BytesIO
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import UserProfile
from .serializers import UserProfileSerializer


@api_view(["GET", "POST"])
def user_list(request):
    if request.method == "GET":
        users = UserProfile.objects.all()
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        telegram = request.data.get("telegram")
        if not telegram:
            return Response({"error": "telegram required"}, status=400)
        user, created = UserProfile.objects.get_or_create(telegram=telegram)
        serializer = UserProfileSerializer(user)
        return Response(serializer.data, status=201 if created else 200)


@api_view(["GET", "PATCH"])
def user_detail(request, telegram):
    try:
        user = UserProfile.objects.get(telegram=telegram)
    except UserProfile.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    if request.method == "GET":
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

    if request.method == "PATCH":
        role = request.data.get("role")
        if role is not None:
            user.role = role

        pfp = request.FILES.get("pfp")
        if pfp:
            webp_bytes = convert_to_webp(pfp)
            webp_name = f"{os.path.splitext(pfp.name)[0]}.webp"
            user.pfp.save(webp_name, ContentFile(webp_bytes))

        designer_name = request.data.get("designer_name")
        if designer_name is not None:
            user.designer_name = designer_name

        logo = request.FILES.get("designer_logo")
        if logo:
            webp_bytes = convert_to_webp(logo)
            webp_name = f"{os.path.splitext(logo.name)[0]}.webp"
            user.designer_logo.save(webp_name, ContentFile(webp_bytes))

        user.save()
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)


@api_view(["POST"])
def upload_runway_gif(request, telegram):
    try:
        user = UserProfile.objects.get(telegram=telegram)
    except UserProfile.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    files = request.FILES.getlist("files")
    urls = []

    for f in files:
        ext = os.path.splitext(f.name)[1].lower()
        if ext in (".gif", ".mp4", ".webm"):
            temp_in = f"/tmp/runway_{f.name}"
            temp_out = f"/tmp/runway_out_{os.path.splitext(f.name)[0]}.mp4"
            with open(temp_in, "wb") as buf:
                for chunk in f.chunks():
                    buf.write(chunk)
            try:
                subprocess.run(
                    ["ffmpeg", "-y", "-i", temp_in,
                     "-c:v", "libx264", "-preset", "fast",
                     "-crf", "23", "-pix_fmt", "yuv420p",
                     temp_out],
                    check=True, capture_output=True, timeout=120,
                )
            except subprocess.CalledProcessError:
                continue
            finally:
                if os.path.exists(temp_in):
                    os.remove(temp_in)

            with open(temp_out, "rb") as rf:
                django_file = File(rf, name=os.path.basename(temp_out))
                path = default_storage.save(f"runway/{django_file.name}", django_file)
            if os.path.exists(temp_out):
                os.remove(temp_out)
            urls.append(f"{settings.MEDIA_URL}{path}")
        else:
            path = default_storage.save(f"runway/{f.name}", f)
            urls.append(f"{settings.MEDIA_URL}{path}")

    current = list(user.runway_gifs)
    current.extend(urls)
    user.runway_gifs = current
    user.save()

    return Response({"urls": urls})


def convert_to_webp(image_file):
    img = Image.open(image_file)
    img = img.convert("RGB")
    buf = BytesIO()
    img.save(buf, format="WEBP", quality=85)
    return buf.getvalue()
