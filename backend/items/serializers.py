from rest_framework import serializers
from .models import Item, ItemColor, ItemColorImage, ItemShoeModel, Favorite


class ItemColorImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemColorImage
        fields = ["id", "image", "webp"]


class ItemColorSerializer(serializers.ModelSerializer):
    images = ItemColorImageSerializer(many=True, read_only=True)

    class Meta:
        model = ItemColor
        fields = ["id", "name", "hex", "order", "images"]


class ItemShoeModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemShoeModel
        fields = ["id", "file", "name"]


class ItemSerializer(serializers.ModelSerializer):
    colors = ItemColorSerializer(many=True, read_only=True)
    shoe_models = ItemShoeModelSerializer(many=True, read_only=True)
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = [
            "id", "title", "brand", "price", "description", "collection",
            "type", "gender", "condition", "size", "custom_size",
            "shoe_standard", "country", "seller_telegram",
            "is_resale", "designer_telegram", "created_at",
            "colors", "shoe_models", "is_favorited",
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
