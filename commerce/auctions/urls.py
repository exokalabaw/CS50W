from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("my-listings", views.my_listings, name="my_listings"),
    path("my-watchlist", views.my_watchlist, name="my_watchlist"),
    path("categories", views.categories, name="categories"),
    path("listing/<int:listing_id>", views.listing, name="listing"),
    path("category/<int:id>", views.category, name="category"),
    path("add-listing", views.add_listing, name="add_listing"),
    path("edit-listing/<int:id>", views.edit_listing, name="edit_listing"),
    path("delete-listing/<int:id>", views.delete_listing, name="delete_listing"),
    path("close-listing/<int:id>", views.close_listing, name="close_listing"),
    path("watchlist/<int:id>/<slug:action>", views.watchlist, name="watchlist"),
    path("delete-comment/<int:id>", views.delete_comment, name="delete_comment"),
    path("wins", views.wins, name="wins")
]
