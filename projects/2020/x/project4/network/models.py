from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.TextField()
    date = models.DateTimeField(auto_now_add=True, blank=True)
    def __str__(self):
        return f"{self.id} by {self.owner} on {self.date}"
    def serialize(self):
        return {
            "id":self.id,
            "owner":self.owner.id,
            "username":self.owner.username,
            "post":self.post,
            "date": self.date.strftime("%b %d %Y, %I:%M %p")
        }

class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follower")
    followee = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followee")
    date = models.DateTimeField(auto_now_add=True, blank=True)
    def __str__(self):
        return f"{self.follower} followed {self.followee}"

class Like(models.Model):
    liker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="liker")
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True, blank=True)
    liked = models.BooleanField(default=False)
    def __str__(self):  
        if self.liked:
            s = "liked"
        else:
            s = "not liked"
        return f"{self.liker} - {self.post.post[:25] }... ({s})"
    def serialize(self):
        return{
            "liker": self.liker.id,
            "post": self.post.id,
        }

