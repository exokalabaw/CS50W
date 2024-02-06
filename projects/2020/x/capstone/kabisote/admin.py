from django.contrib import admin

from .models import User, Tag, Quiz, Quiz_item, Quiz_history,Answer_item, Bookmark, Follow

class AnswerInline(admin.TabularInline):
    model = Answer_item

class QuizItemAdmin(admin.ModelAdmin):
    inlines = [AnswerInline]

class QuizItemInline(admin.TabularInline):
    model = Quiz_item

class QuizAdmin(admin.ModelAdmin):
    inlines = [QuizItemInline]
admin.site.register(User)
admin.site.register(Tag)
admin.site.register(Quiz, QuizAdmin)
admin.site.register(Quiz_item,QuizItemAdmin)
admin.site.register(Quiz_history)
admin.site.register(Bookmark)
admin.site.register(Follow)
# Register your models here.
