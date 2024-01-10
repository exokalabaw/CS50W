from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse

from .models import User, Listing, Cat, Watchlist_Item, Bid, Comment
from .forms import ListingForm, BidForm, ListingEditForm, CommentForm


def index(request):
    a_items = Listing.objects.filter(status = "o").order_by("listing_date")
    
    p = {"items" : a_items, "user": request.user}
    return render(request, "auctions/index.html", p)

def my_listings(request):
    if request.user.is_authenticated:
        my_items = Listing.objects.filter( user_id = request.user.id).order_by("listing_date")
        i ={ "items" :  my_items, "title" : "My Listings", }
        return render(request, "auctions/my-listings.html", i )
    else:
        return redirect("/")
def my_watchlist(request):

    if request.user.is_authenticated:
        myshlist = Listing.objects.filter(watchlist_item__watcher_id =  request.user.id, status="o")
        j = { "items" : myshlist, "title": "My Watchlist"}
        return render(request, "auctions/my-listings.html", j )
    else:
        return redirect("/")


def category(request, id):
    c = Listing.objects.filter(category=id)
    cn = Cat.objects.get(id=id)
    h = {"items": c, "title": "Category", "category": cn}
    return render(request, "auctions/my-listings.html", h )
def categories(request):
    cats = Cat.objects.all()
    dog = []
    for cat in cats:
        d = cat.name.capitalize()
        dog.append({"name": cat.name, "id":cat.id, "cap":d})
    items = { "items" : dog}
    return render(request, "auctions/categories.html", items)


def login_view(request):
    if request.user.is_authenticated:
        return redirect("/")
    else:
        if request.method == "POST":

            # Attempt to sign user in
            username = request.POST["username"]
            password = request.POST["password"]
            user = authenticate(request, username=username, password=password)

            # Check if authentication successful
            if user is not None:
                login(request, user)
                return HttpResponseRedirect(reverse("index"))
            else:
                return render(request, "auctions/login.html", {
                    "message": "Invalid username and/or password."
                })
        else:
            return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.user.is_authenticated:
        return redirect("/")
    else:
        if request.method == "POST":
            username = request.POST["username"]
            email = request.POST["email"]

            # Ensure password matches confirmation
            password = request.POST["password"]
            confirmation = request.POST["confirmation"]
            if password != confirmation:
                return render(request, "auctions/register.html", {
                    "message": "Passwords must match."
                })

            # Attempt to create new user
            try:
                user = User.objects.create_user(username, email, password)
                user.save()
            except IntegrityError:
                return render(request, "auctions/register.html", {
                    "message": "Username already taken."
                })
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/register.html")

def listing(request, listing_id):
    item = Listing.objects.get(id = listing_id)
    hb = Bid.objects.filter(listing_id = listing_id)[:1]
    wl = Watchlist_Item.objects.filter(listing_id=listing_id, watcher_id=request.user.id).first()
    hbs = None
    bidform = None
    commentform = CommentForm()
    commentform.fields['author_id'].widget.attrs['value'] = request.user.id
    commentform.fields['listing_id'].widget.attrs['value']= listing_id
    if hb:
        hbs = hb[0]
    if request.method == "POST":
        print(request.POST)
        try:
            
            bidform = BidForm(request.POST)
            bp =   bidform['bid_price']
            if bidform.is_valid():
                d = bidform.save(commit=False)
                d.owner_id = request.user
                d.save()
                # save and go back to the listing
                return redirect(f"/listing/{listing_id}?success=bid+saved")
        except:
            commentform = CommentForm(request.POST)
            if commentform.is_valid():
                k = commentform.save(commit=False)
                k.save()
                return redirect(f"/listing/{listing_id}?success=comment+saved")
            # commentform = CommentForm(request.POST)
            print('this is not a bid form')
        
        
        
    else:
        bidform = BidForm()
        bidform.fields['listing_id'].widget.attrs['value'] = listing_id
        
        if not listing_id:
            return redirect("/")
        
    return render(request,"auctions/listing.html", {"item" : item, "bidform" : bidform, "hb": hbs, "inwatchlist":wl, "commentform" : commentform})

def add_listing(request):
    if request.method == "POST":
        indata = ListingForm(request.POST)
        
        if indata.is_valid():
            k = indata.save(commit=False)
            k.user_id = request.user
            k.save()
            return redirect(f"/listing/{k.pk}?success=New+listing+saved")

        else:
            return render(request, "auctions/addedit.html",{"type": "Add", "form":k})
    else:
        form = ListingForm()
        f = { "form" : form , "type" : "Add", "user_id": request.user.id} 
        return render(request, "auctions/addedit.html", f)
    
def edit_listing(request, id):
    item = Listing.objects.get(id = id)
    if item.user_id.id == request.user.id:
        if request.method == "POST":
            data = ListingEditForm(request.POST)
            
            if data.is_valid():
                s = data.save(commit=False)
                s.user_id = request.user
                s.id = id
                s.listing_date = item.listing_date
                s.status = item.status
                s.winner_id = item.winner_id
                data.save()
                return redirect(f"/listing/{id}?success=Listing+edits+saved")
            else:
                return render(request, "auctions/addedit.html",{"type": "Add", "form":data})
        else:
            post  = Listing.objects.get(id = id)
            print(f"post object is {post} n/")
            form  = ListingEditForm(instance=post)
            print(f"Listing form  is {form} n/")
            return render(request, "auctions/addedit.html",{"type": "Edit", "form":form})
    else:
        return redirect("/")

def close_listing(request, id):
    item = Listing.objects.get(id = id)
    if item.user_id.id == request.user.id:
        item.status = "c"
        item.winner_id = request.user
        item.save()
        return redirect(f"/listing/{id}?success=Listing+closed")      
        
    else:
        return redirect("/")
def delete_listing(request,id):
    item = Listing.objects.get(id = id)
    print(f"user id is {item.user_id.id} logged in user is {request.user.id}")
    if item.user_id.id == request.user.id:
        item.delete()
        return redirect(f"/?success=deleted+item+{id}")
    else:
        return redirect(f"/listing/{id}?error=What+are+you+doing")
def delete_comment(request,id):
    comment = Comment.objects.get(id=id)
    if comment.author_id.id == request.user.id:
        comment.delete()
        return redirect(f"/listing/{comment.listing_id.id}?success=Comment+deleted")
    else: 
        return redirect(f"/listing/{id.listing_id.id}?error=What+are+you+doing")
def watchlist(request, id, action):
    item = Listing.objects.get(id = id)
    wl = Watchlist_Item.objects.filter(listing_id=id,watcher_id=request.user.id).first()
    print(f"")
    if wl and action == "remove":
        wl.delete()
        return redirect(f"/listing/{id}?success=Removed+from+watchlist")
    elif action == "add" :
        print('does this take the error away')
        wl = Watchlist_Item(watcher_id=request.user, listing_id=item)
        wl.save()
        return redirect(f"/listing/{id}?success=Added+to+watchlist")
    else:
        return redirect(f"/listing/{id}?error=What+are+you+doing")
    

def wins(request):
    items = Listing.objects.filter(status = "c", winner_id = request.user)
    p ={ "items" :  items, "title" : "Listings Won", }
    return render(request, "auctions/my-listings.html", p)

    


 



         

