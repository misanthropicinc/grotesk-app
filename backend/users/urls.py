from django.urls import path
from . import views

urlpatterns = [
    path("", views.user_list, name="user-list"),
    path("<str:telegram>/", views.user_detail, name="user-detail"),
    path("<str:telegram>/runway/", views.upload_runway_gif, name="upload-runway"),
]
