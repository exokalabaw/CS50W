
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("feed", views.feed, name="feed"),
    path("checklike/<int:post>", views.checklike, name="checklike"),
    path("liketoggle/<int:post>", views.liketoggle, name="liketoggle"),
    path("poster", views.poster, name="poster"),
    path("u/<int:id>", views.u, name="u"),
    path("user/<int:id>", views.userview, name="userview"),
    path("f", views.f, name="f"),
    path("following", views.following, name="following"),
    path("editpost/<int:id>", views.editpost, name="editpost")
]
