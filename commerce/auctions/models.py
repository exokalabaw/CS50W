from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Cat(models.Model):
    name = models.CharField(max_length=255, unique=True)
    def __str__(self):
        return self.name

class Listing(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    starting_price = models.DecimalField(default=0, max_digits=12, decimal_places=2)
    image = models.URLField(blank=True)
    class Opts_Status(models.TextChoices):
        CLOSED = "c", ('closed'),
        OPEN = "o", ('open')
    status = models.CharField(
        max_length=1,
        choices = Opts_Status,
        default = Opts_Status.OPEN
    )
    listing_date = models.DateTimeField(auto_now_add=True, blank=True)
    category = models.ManyToManyField(Cat, blank=True)
    winner_id = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, related_name="winner", null=True)
    def __str__(self):
        return self.title

class Bid(models.Model):
    owner_id = models.ForeignKey(User, on_delete=models.CASCADE)
    listing_id = models.ForeignKey(Listing, on_delete=models.CASCADE)
    bid_price = models.DecimalField(default=0, max_digits=12, decimal_places=2)
    class re(models.TextChoices):
        WINNER = "w", 'winner',
        LOSER = "l", 'loser',
        PENDING = "p",'pending'
    result = models.CharField(
        max_length = 1,
        choices = re.choices,
        default = re.PENDING)
    bid_date = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ['-bid_price']
    def __str__(self):
        return f"{self.bid_price} - {self.owner_id} on {self.listing_id} ({ self.get_result_display()})"
    
    
class Watchlist_Item(models.Model):
    watcher_id = models.ForeignKey(User,on_delete=models.CASCADE)
    listing_id = models.ForeignKey(Listing,on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.listing_id} followed by {self.watcher_id}"


class Comment(models.Model):
    author_id = models.ForeignKey(User,on_delete=models.CASCADE)
    listing_id = models.ForeignKey(Listing,on_delete=models.CASCADE)
    comment_text = models.TextField()
    comment_date = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ['-comment_date']
    def __str__(self):
        d = self.comment_date.strftime("%d-%m-%Y")
        return f"{self.author_id} on {self.listing_id} ({d})"

    
