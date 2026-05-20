from django.db import models

class UserProfile(models.Model):
    telegram = models.CharField(max_length=100, unique=True, db_index=True)
    role = models.CharField(max_length=20, default="")
    pfp = models.ImageField(upload_to="pfps/", blank=True)
    designer_name = models.CharField(max_length=200, blank=True)
    designer_logo = models.ImageField(upload_to="logos/", blank=True)
    runway_gifs = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.telegram

    @property
    def designer_profile(self):
        if self.designer_name:
            return {
                "name": self.designer_name,
                "logo": self.designer_logo.url if self.designer_logo else None,
                "runwayGifs": self.runway_gifs,
            }
        return None
