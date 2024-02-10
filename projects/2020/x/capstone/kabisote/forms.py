from django import forms
from .models import Quiz

class QuizForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'form-control'
            
        self.fields['private'].widget.attrs.update({"class":'form-check-input'})
    
    class Meta:
        model = Quiz
        fields = ["title", "description", "private", "tag"]
        labels = {
            "tag": "Category:",
            "private": "Private"
        }
        widgets = {
            "tag":forms.TextInput(attrs={"placeholder":'separate categories with a comma' })
        }
class QuizEditForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'form-control'
        self.fields['private'].widget.attrs.update({"class":'form-check-input'})
    
    class Meta:
        model = Quiz
        fields = ["title", "description", "private"]
        labels = {
            "tag": "Category:",
            "private": "Private"
        }
        