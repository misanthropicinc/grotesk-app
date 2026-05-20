from rest_framework import serializers
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "telegram", "role", "pfp", "designer_name",
            "designer_logo", "runway_gifs", "created_at",
        ]
