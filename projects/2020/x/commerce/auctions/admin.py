from django.contrib import admin

from .models import User,Cat, Listing, Bid, Watchlist_Item, Comment

admin.site.register(User)
admin.site.register(Cat)
admin.site.register(Listing)
admin.site.register(Bid)
admin.site.register(Watchlist_Item)
admin.site.register(Comment)
# Register your models here.
