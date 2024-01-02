from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("wiki/<slug:title>", views.entry, name="entry"),
    path("wiki/rand", views.entry, name="entry"),
    path("search", views.search, name="search"),
    path("add", views.add, name="add"),
    path("edit/<slug:title>", views.edit, name="edit"),
]


