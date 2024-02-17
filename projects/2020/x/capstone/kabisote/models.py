from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Tag(models.Model):
    name = models.CharField(max_length=255, unique=True)
    
    def __str__(self):
        return self.name

class Quiz(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    private = models.BooleanField(default=False)
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True, blank=True)
    tag = models.ManyToManyField(Tag, related_name="tags", blank=True)
    
    class Meta:
        ordering = ['-updated']
    def serialize(self):
        tags = []
        for t in self.tag.all():
            k = {
                "id": t.id,
                "tag": t.name
            }
            tags.append(k)
    
        return{
            "id": self.id,
            "owner": self.owner.id,
            "username": self.owner.username,
            "title": self.title,
            "updated": self.updated.strftime("%b %d, %Y"),
            "created": self.created.strftime("%b %d, %Y"),
            "tags":tags,
            "description": self.description,
        }
    def tagsastext(self):
        tags = ""
        for b in self.tag.all():
            if tags == "":
                tags += b.name
            else:
                tags += f", {b.name}"
        return tags
        
    
    def __str__(self):
        return f"{self.title} by {self.owner}"



class Quiz_item(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    question = models.TextField()
    class Quiz_types(models.TextChoices):
        MULTIPLE_CHOICE = "mcoa", ('multiple choice, one answer'),
        TEXTBOX = "txt", ("textbox"),
        MULTIPLE_ANSWER = "mcma", ('multiple choice, multiple aswer'),
        ORDERED_ANSWER = "oa", ('ordered answer')
    quiz_type = models.CharField(
        max_length = 4,
        choices = Quiz_types
    )
    question_number = models.IntegerField()
    points = models.IntegerField(default=1)
    def __str__(self):
        return f"#{self.question_number} of {self.quiz_id} - {self.question}"
    def serialize(self):
        k = []
        for i in self.answer_item_set.all():
            d = i.possible_answers()
            k.append(d)
        return{
            "id":self.id,
            "question": self.question,
            "quiz_id": self.quiz.id,
            "question_number": self.question_number,
            "quiz_type": self.quiz_type,
            "points": self.points,
            "answers":k
        }
    def serializeForEdit(self):
        b = []
        for i in self.answer_item_set.all():
            d = i.answer_key()
            b.append(d)
        return{
            "id":self.id,
            "question": self.question,
            "quiz_id": self.quiz.id,
            "question_number": self.question_number,
            "quiz_type": self.quiz_type,
            "points": self.points,
            "answers":b
        }
    def answer_key(self):
        j = []
        for g in self.answer_item_set.all():
            l = g.answer_key()
            j.append(l)
        return{
            "id":self.id,
            "quiz_type":self.quiz_type,
            "points":self.points,
            "answers":j
        }
    #set ordering by get/set _answer_order
class Answer_item(models.Model):
    question = models.ForeignKey(Quiz_item, on_delete=models.CASCADE)
    answer = models.TextField()
    is_correct = models.BooleanField(default=True)
    answer_weight = models.IntegerField(default=1)
    class Meta:
        unique_together = ['question', 'answer_weight']
    def possible_answers(self):
        return{
            "question_id": self.question.id,
            "possible_answer":self.answer,
            "id":self.id
        }
    def answer_key(self):
        return{
            "possible_answer":self.answer,
            "id": self.id,
            "is_correct" : self.is_correct
        }

class Quiz_history(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    taker = models.ForeignKey(User,on_delete=models.CASCADE)
    score = models.IntegerField()
    hps = models.IntegerField()
    started = models.DateTimeField()
    finished = models.DateTimeField()
    def __str__(self):
        return f"{self.quiz} - {self.taker} on {self.started}"

class Bookmark(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    class Meta:
        unique_together = ['quiz', 'owner']
    def __str__(self):
        return f"{self.owner} bookmarked {self.quiz}"

class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follower")
    followee = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followee")
    class Meta:
        unique_together = ['follower', 'followee']
    def __str__(self):
        return f"{self.follower} followed {self.followee}"