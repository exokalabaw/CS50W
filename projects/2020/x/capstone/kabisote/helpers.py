from .models import Tag, Quiz, Bookmark, Follow
from django.core.paginator import Paginator
from django.contrib.auth.decorators import login_required


def isowner(owner, currentuser):
    if owner == currentuser:
        return True
    else:
        return False
# assuming pagetypes are public, user, bookmarked, tag, following
def plok(request, ptid, pagetype):
#if the page type is a tag, the id is the tag id, if the page type is a user's or an id the id is the user id
    if pagetype =="public":
        qs = Quiz.objects.filter(private = False)
    elif pagetype == "user":
        if isowner(ptid, request.user.id):
            qs = Quiz.objects.filter(owner_id =request.user.id)
        else:
            qs = Quiz.objects.filter(owner_id = ptid, private = False)
    
    
    elif pagetype == "bookmarked":
        bookmarks = Bookmark.objects.filter(owner_id = request.user.id)
        bids = []
        for b in bookmarks:
            bids.append(b.quiz_id)
        qs = Quiz.objects.filter(id__in = bids, private = False)

    elif pagetype == "following":
        following = Follow.objects.filter(follower_id = request.user.id)
        fids = []
        for f in following:
            fids.append(f.followee_id)
        qs = Quiz.objects.filter(owner_id__in = fids, private = False)
    elif pagetype == "tag":
        tagged = Tag.objects.get(id = ptid)
        g = tagged.tags.all()
        qs = g

        

    paginator = Paginator(qs, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    has_next = page_obj.has_next()
    has_previous = page_obj.has_previous()
    end_index = paginator.num_pages
    plists = [quiz.serialize() for quiz in page_obj]
    r = {'posts':plists,'has_next':has_next,'has_previous':has_previous,'end':end_index}
    return r

def validpage(request, type):
    if type == "public" or type == "tag":
        return True
    elif type == "user" or type == "bookmarked" or type == "following":
        if  request.user.is_authenticated:
            return True
        else:
            return False
    else:
        return False
def sortAnswerIds(question):
    l = []
    for q in question['answers']:
        if q['is_correct']:
            l.append(q['id'])
    return l
def sortPossibleAnswers(question):
    b = []
    for h in question['answers']:
        b.append(h['possible_answer'])
    return b
def findUserAnswer(question_id, answer_items):
    r = []
    for i in answer_items:
        if i['question_id'] == question_id:
            r = i['answers']
    return r
def processTXT(pa, ua):
    for a in pa:
        if a == ua[0]:
            return True
    return False
def processMCOA(ai, ua):
    if ai[0] == ua[0]:
            return True
    return False
def processOA(ai, ua):
    for i in range(len(ai)): 
        if ai[i] != ua[i]:
            return False
    return True
def processMCMA(ai, ua):
    for answer in ai:
        notfound = True
        for answeru in ua:
            if answeru == answer:
                notfound = False
        if notfound:
            return False
    return True