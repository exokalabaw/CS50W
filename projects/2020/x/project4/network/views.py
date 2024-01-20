import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.http import Http404

from .models import User,Post, Follow, Like
from .helpers import plok, isowner


def index(request):
    return render(request, "network/index.html",{"feedtype":"all"})

def userview(request, id):
    
    try:
        followmatch= Follow.objects.get(followee_id = id, follower_id = request.user.id)
        followcheck = True
    except Follow.DoesNotExist:
        followcheck = False
    if request.method == "POST":
        if followcheck:
            followmatch.delete()
            followcheck = False
        else:
            newfollow = Follow(followee_id = id, follower_id = request.user.id)
            newfollow.save()
            followcheck = True
    

    u = User.objects.get(id=id)
    username = u.username
    followees = Follow.objects.filter(follower_id = id).count()
    followers = Follow.objects.filter(followee_id = id).count()
    followcheck = Follow.objects.filter(followee_id = id, follower_id = request.user.id).count()
    
    return render(request, "network/index.html", {"id":id, "username": username, "followees":followees, "followers":followers, "followcheck":followcheck, "feedtype":"user"})

def f(request):
    posts = plok(request, request.user.id, "follows") 
    return JsonResponse(posts, safe=False)

@login_required
def following(request):
    return render(request, "network/index.html", {"feedtype":"following"})

def login_view(request):
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
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

def u(request, id):
    posts = plok(request, id, "user") 
    return JsonResponse(posts, safe=False)
def feed(request):
    posts = plok(request, None, "main")
    # posts = Post.objects.filter().order_by("-date")
    # paginator = Paginator(posts, 10)
    # page_number = request.GET.get('page')
    # page_obj = paginator.get_page(page_number)
    # has_next = page_obj.has_next()
    # has_previous = page_obj.has_previous()
    # end_index = paginator.num_pages
    # plists = [post.serialize() for post in page_obj]

    #{'posts':plists,'has_next':has_next,'has_previous':has_previous,'end':end_index}
    return JsonResponse(posts, safe=False)

@csrf_exempt
def checklike(request, post):
    ps = Like.objects.filter(post_id = int(post), liked = True).count()
    p = None
    if request.user.is_authenticated:
        try:
            p = Like.objects.get(liker = request.user, post_id= int(post) )
        except Like.DoesNotExist:
            p = Like.objects.create(liker = request.user, post_id= int(post) )

        return JsonResponse([{"liked": p.liked, "count": ps}], safe=False)
    else:
        return JsonResponse([{"liked": 0, "count": ps}], safe=False)    

@login_required
@csrf_exempt
def liketoggle(request, post):
    if request.method == "PUT":
        p = Like.objects.get(liker = request.user, post_id= int(post) )
        rb = json.loads(request.body)
        p.liked = rb['liked']
        p.save()
        # print(rb['liked'])
        return JsonResponse([{"liked": p.liked}], safe=False)
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)
def poster(request):
    if request.method == "POST":
        np = request.POST
        
        p=Post(owner = request.user, post=np['body'])
        t = p.save()
        
        return HttpResponseRedirect(reverse("index"))

    else:
        return JsonResponse({
            "error": "POST request required."
        }, status=400)
@login_required
@csrf_exempt
def editpost(request, id):

    if request.method == "PUT":
        p = Post.objects.get(id=int(id))
        if isowner(p.owner_id, request.user.id):
            rb = json.loads(request.body)
            p.post = rb['post']
            p.save()
            return JsonResponse([{"body": p.post}], safe=False)
        else:
            return JsonResponse({
            "error": "What are you doing."
        }, status=400)
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)

def error404(request, exception):
    return render(request, 'network/404.html',status=404)

