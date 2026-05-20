from django.urls import path
from . import views

urlpatterns = [
    path("", views.item_list, name="item-list"),
    path("<int:item_id>/", views.item_detail, name="item-detail"),
    path("favorites/", views.favorites, name="favorites"),
    path("convert-runway/", views.convert_runway, name="convert-runway"),
]
