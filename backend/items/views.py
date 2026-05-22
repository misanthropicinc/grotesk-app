import json
import subprocess
import os
from io import BytesIO
from PIL import Image
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Item, ItemColor, ItemColorImage, ItemShoeModel, Favorite
from .serializers import ItemSerializer, FavoriteSerializer


@api_view(["GET", "POST"])
def item_list(request):
    if request.method == "GET":
        telegram = request.query_params.get("telegram")
        if telegram:
            items = Item.objects.filter(seller_telegram=telegram)
        else:
            items = Item.objects.all()
        serializer = ItemSerializer(items, many=True, context={"request": request})
        return Response(serializer.data)

    if request.method == "POST":
        data = request.data
        item = Item.objects.create(
            title=data.get("title"),
            brand=data.get("brand"),
            price=data.get("price"),
            description=data.get("description", ""),
            collection=data.get("collection", ""),
            color_name=data.get("color_name", ""),
            color_hex=data.get("color_hex", ""),
            type=data.get("type"),
            gender=data.get("gender"),
            condition=data.get("condition"),
            size=data.get("size", ""),
            custom_size=data.get("custom_size", ""),
            shoe_standard=data.get("shoe_standard", ""),
            country=data.get("country"),
            seller_telegram=data.get("seller_telegram"),
            is_resale=data.get("is_resale", False),
            designer_telegram=data.get("designer_telegram", ""),
        )

        colors_json = data.get("colors")
        if colors_json:
            try:
                colors_data = json.loads(colors_json)
                all_images = request.FILES.getlist("images")
                img_idx = 0
                for order, cd in enumerate(colors_data):
                    color = ItemColor.objects.create(
                        item=item,
                        name=cd.get("name", ""),
                        hex=cd.get("hex", "#000000"),
                        order=order,
                    )
                    count = cd.get("imageCount", 0)
                    for _ in range(count):
                        if img_idx < len(all_images):
                            img = all_images[img_idx]
                            webp_bytes = convert_to_webp(img)
                            ci = ItemColorImage(color=color)
                            ci.image.save(img.name, img, save=False)
                            webp_name = f"{os.path.splitext(img.name)[0]}.webp"
                            ci.webp.save(webp_name, ContentFile(webp_bytes), save=False)
                            ci.save()
                            img_idx += 1
            except json.JSONDecodeError:
                pass

        shoe_files = request.FILES.getlist("shoe_models")
        for sf in shoe_files:
            ItemShoeModel.objects.create(
                item=item,
                file=sf,
                name=sf.name,
            )

        serializer = ItemSerializer(item, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "DELETE"])
def item_detail(request, item_id):
    try:
        item = Item.objects.get(id=item_id)
    except Item.DoesNotExist:
        return Response({"error": "Item not found"}, status=404)

    if request.method == "GET":
        serializer = ItemSerializer(item, context={"request": request})
        return Response(serializer.data)

    if request.method == "PATCH":
        data = request.data
        for field in ["title", "brand", "price", "description", "collection",
                       "color_name", "color_hex", "type", "gender", "condition",
                       "size", "custom_size", "shoe_standard", "country",
                       "seller_telegram", "designer_telegram"]:
            val = data.get(field)
            if val is not None:
                setattr(item, field, val)
        if data.get("is_resale") is not None:
            item.is_resale = data.get("is_resale") in ("true", "True", True, "1", 1)
        item.save()

        colors_json = data.get("colors")
        if colors_json:
            item.colors.all().delete()
            try:
                colors_data = json.loads(colors_json)
                all_images = request.FILES.getlist("images")
                img_idx = 0
                for order, cd in enumerate(colors_data):
                    color = ItemColor.objects.create(
                        item=item,
                        name=cd.get("name", ""),
                        hex=cd.get("hex", "#000000"),
                        order=order,
                    )
                    count = cd.get("imageCount", 0)
                    for _ in range(count):
                        if img_idx < len(all_images):
                            img = all_images[img_idx]
                            webp_bytes = convert_to_webp(img)
                            ci = ItemColorImage(color=color)
                            ci.image.save(img.name, img, save=False)
                            webp_name = f"{os.path.splitext(img.name)[0]}.webp"
                            ci.webp.save(webp_name, ContentFile(webp_bytes), save=False)
                            ci.save()
                            img_idx += 1
            except json.JSONDecodeError:
                pass

        shoe_files = request.FILES.getlist("shoe_models")
        if shoe_files:
            item.shoe_models.all().delete()
            for sf in shoe_files:
                ItemShoeModel.objects.create(
                    item=item,
                    file=sf,
                    name=sf.name,
                )

        serializer = ItemSerializer(item, context={"request": request})
        return Response(serializer.data)

    if request.method == "DELETE":
        item.delete()
        return Response(status=204)


@api_view(["GET", "POST", "DELETE"])
def favorites(request):
    telegram = request.query_params.get("telegram") or request.data.get("telegram")
    if not telegram:
        return Response({"error": "telegram required"}, status=400)

    if request.method == "GET":
        favs = Favorite.objects.filter(telegram=telegram).select_related("item")
        items = [f.item for f in favs]
        serializer = ItemSerializer(items, many=True, context={"request": request})
        return Response(serializer.data)

    if request.method == "POST":
        item_id = request.data.get("item_id")
        try:
            item = Item.objects.get(id=item_id)
        except Item.DoesNotExist:
            return Response({"error": "Item not found"}, status=404)
        fav, created = Favorite.objects.get_or_create(telegram=telegram, item=item)
        if created:
            return Response({"status": "favorited"}, status=201)
        return Response({"status": "already favorited"})

    if request.method == "DELETE":
        item_id = request.query_params.get("item_id")
        if not item_id:
            return Response({"error": "item_id required"}, status=400)
        deleted, _ = Favorite.objects.filter(telegram=telegram, item_id=item_id).delete()
        return Response({"status": "removed" if deleted else "not found"})


@api_view(["POST"])
def convert_runway(request):
    """Convert uploaded GIF/MP4 to MP4 using FFmpeg."""
    f = request.FILES.get("file")
    if not f:
        return Response({"error": "file required"}, status=400)

    ext = os.path.splitext(f.name)[1].lower()
    if ext not in (".gif", ".mp4", ".webm"):
        return Response({"error": "only GIF/MP4/WebM accepted"}, status=400)

    temp_in = f"/tmp/runway_in_{f.name}"
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
        return Response({"error": "FFmpeg conversion failed"}, status=500)
    finally:
        if os.path.exists(temp_in):
            os.remove(temp_in)

    from django.core.files import File
    with open(temp_out, "rb") as result_file:
        django_file = File(result_file, name=os.path.basename(temp_out))
        path = default_storage.save(f"runway/{django_file.name}", django_file)
    if os.path.exists(temp_out):
        os.remove(temp_out)

    return Response({"url": f"{settings.MEDIA_URL}{path}"})


def convert_to_webp(image_file):
    """Convert an uploaded image to WebP bytes."""
    img = Image.open(image_file)
    img = img.convert("RGB")
    buf = BytesIO()
    img.save(buf, format="WEBP", quality=82)
    return buf.getvalue()
