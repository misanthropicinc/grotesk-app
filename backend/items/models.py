from django.db import models


class Item(models.Model):
    title = models.CharField(max_length=200)
    brand = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    collection = models.CharField(max_length=100, blank=True)
    color_name = models.CharField(max_length=50, blank=True, default="")
    color_hex = models.CharField(max_length=7, blank=True, default="")
    type = models.CharField(max_length=50)
    gender = models.CharField(max_length=20)
    condition = models.CharField(max_length=20)
    size = models.CharField(max_length=20)
    custom_size = models.CharField(max_length=20, blank=True)
    shoe_standard = models.CharField(max_length=10, blank=True)
    country = models.CharField(max_length=100)
    seller_telegram = models.CharField(max_length=100, db_index=True)
    is_resale = models.BooleanField(default=False)
    designer_telegram = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.brand}"


class ItemColor(models.Model):
    item = models.ForeignKey(Item, related_name="colors", on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    hex = models.CharField(max_length=7)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.name} ({self.hex})"


class ItemColorImage(models.Model):
    color = models.ForeignKey(ItemColor, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="items/colors/")
    webp = models.ImageField(upload_to="items/colors/webp/", blank=True)

    def __str__(self):
        return f"Image for {self.color.name}"


class ItemShoeModel(models.Model):
    item = models.ForeignKey(Item, related_name="shoe_models", on_delete=models.CASCADE)
    file = models.FileField(upload_to="shoe_models/")
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Favorite(models.Model):
    telegram = models.CharField(max_length=100, db_index=True)
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="favorites")

    class Meta:
        unique_together = ("telegram", "item")

    def __str__(self):
        return f"{self.telegram} favorited {self.item.title}"
