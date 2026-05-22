from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name="Item",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=200)),
                ("brand", models.CharField(max_length=100)),
                ("price", models.DecimalField(decimal_places=2, max_digits=10)),
                ("description", models.TextField(blank=True)),
                ("collection", models.CharField(blank=True, max_length=100)),
                ("type", models.CharField(max_length=50)),
                ("gender", models.CharField(max_length=20)),
                ("condition", models.CharField(max_length=20)),
                ("size", models.CharField(max_length=20)),
                ("custom_size", models.CharField(blank=True, max_length=20)),
                ("shoe_standard", models.CharField(blank=True, max_length=10)),
                ("color_name", models.CharField(blank=True, default="", max_length=50)),
                ("color_hex", models.CharField(blank=True, default="", max_length=7)),
                ("country", models.CharField(max_length=100)),
                ("seller_telegram", models.CharField(db_index=True, max_length=100)),
                ("is_resale", models.BooleanField(default=False)),
                ("designer_telegram", models.CharField(blank=True, max_length=100)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="ItemColor",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=50)),
                ("hex", models.CharField(max_length=7)),
                ("order", models.IntegerField(default=0)),
                ("item", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="colors", to="items.item")),
            ],
            options={
                "ordering": ["order"],
            },
        ),
        migrations.CreateModel(
            name="ItemColorImage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("image", models.ImageField(upload_to="items/colors/")),
                ("webp", models.ImageField(blank=True, upload_to="items/colors/webp/")),
                ("color", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="images", to="items.itemcolor")),
            ],
        ),
        migrations.CreateModel(
            name="ItemShoeModel",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("file", models.FileField(upload_to="shoe_models/")),
                ("name", models.CharField(max_length=100)),
                ("item", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="shoe_models", to="items.item")),
            ],
        ),
        migrations.CreateModel(
            name="Favorite",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("telegram", models.CharField(db_index=True, max_length=100)),
                ("item", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="favorites", to="items.item")),
            ],
            options={
                "unique_together": {("telegram", "item")},
            },
        ),
    ]
