from rest_framework import serializers
from .models import Item, ItemImage, ItemShoeModel, Favorite


class ItemImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = ["id", "image", "webp"]


class ItemShoeModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemShoeModel
        fields = ["id", "file", "name"]


class ItemSerializer(serializers.ModelSerializer):
    images = ItemImageSerializer(many=True, read_only=True)
    shoe_models = ItemShoeModelSerializer(many=True, read_only=True)
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = [
            "id", "title", "brand", "price", "description", "type",
            "gender", "condition", "size", "custom_size", "shoe_standard",
            "color_name", "color_hex", "country", "seller_telegram",
            "is_resale", "designer_telegram", "created_at",
            "images", "shoe_models", "is_favorited",
        ]

    def get_is_favorited(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.favorites.filter(telegram=request.user.username).exists()
        telegram = request.query_params.get("telegram") if request else None
        if telegram:
            return obj.favorites.filter(telegram=telegram).exists()
        return False


class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ["id", "telegram", "item"]
