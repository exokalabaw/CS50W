from django import forms
from .models import User, Listing, Cat, Bid, Comment
from django.core.exceptions import ValidationError
from decimal import Decimal

class ListingForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'form-control'
            visible.field.widget.attrs['placeholder'] = visible.field.label

    class Meta:
        model = Listing
        fields = ["title", "description", "starting_price", "image", "category", ]

class ListingEditForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'form-control'
            visible.field.widget.attrs['placeholder'] = visible.field.label

    class Meta:
        model = Listing
        fields = ["id","title", "description", "starting_price", "image", "category", ]
        widgets = {
            "id": forms.TextInput(attrs={"type":"hidden"})
        }

class BidForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'form-control'
            visible.field.widget.attrs['placeholder'] = visible.field.label
    
    class Meta:
        model = Bid
        fields = ["bid_price", "listing_id"]
        widgets = {
            "listing_id": forms.TextInput(attrs={"value":'', "type":"hidden"})
        }
    def clean(self):
        cleaned_data = super().clean()
        bid = cleaned_data.get('bid_price')
        lid = cleaned_data.get('listing_id')
        item = Listing.objects.get(id = lid.id)

        
        hb = Bid.objects.filter(listing_id = lid.id)[:1]
        isp = Decimal(item.starting_price)
        pzo = Decimal(.01)
        highestbid = isp - pzo
        if hb:
            highestbid = hb[0].bid_price
        if not bid > highestbid:

            raise ValidationError("Your bid is lower than the current price")

class CommentForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'form-control'
            visible.field.widget.attrs['placeholder'] = visible.field.label
    class Meta:
        model = Comment
        fields = ['author_id','listing_id','comment_text']
        labels = {
            "comment_text": ""
        }
        widgets = {
            "author_id" : forms.TextInput(attrs={"value": '', "type":"hidden" }),
            "listing_id" : forms.TextInput(attrs={"value": '', "type":"hidden" }),
            "comment_text": forms.Textarea(attrs={"placeholder": "Add a comment", "rows": 5, "cols": 30})
        }
    

        