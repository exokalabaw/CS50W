from .models import Post, Follow
from django.core.paginator import Paginator
def plok(request, id, pagetype):
    if id == None:
        posts = Post.objects.filter().order_by("-date")
    elif pagetype == "user": 
        posts = Post.objects.filter(owner_id = id).order_by("-date")
    elif pagetype == "follows":

        followees = Follow.objects.filter(follower_id=request.user.id)
        fids = []
        for f in followees:

            fids.append(f.followee_id)

        posts = Post.objects.filter(owner_id__in = fids).order_by("-date")
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    has_next = page_obj.has_next()
    has_previous = page_obj.has_previous()
    end_index = paginator.num_pages
    plists = [post.serialize() for post in page_obj]
    r = {'posts':plists,'has_next':has_next,'has_previous':has_previous,'end':end_index}
    return r

def isowner(postowner, currentuser):
    if postowner == currentuser:
        return True
    else:
        return False