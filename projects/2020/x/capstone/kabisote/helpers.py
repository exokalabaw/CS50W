from .models import Tag, Quiz, Bookmark, Follow, Answer_item
from django.core.paginator import Paginator
from django.contrib.auth.decorators import login_required
from .forms import QuizForm, QuizEditForm
from django.shortcuts import render, redirect


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
    for p in plists:
        bookmarked = Bookmark.objects.filter(quiz_id=p['id'], owner=request.user.id).count()
        p['bookmarked']=bookmarked
    print(plists)
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
def sortCorrectAnswerStrings(question):
    h = []
    for n in question['answers']:
        if n["is_correct"]:
            h.append(n['possible_answer'])
    return h
def findUserAnswer(question_id, answer_items):
    r = []
    for i in answer_items:
        if i['question_id'] == question_id:
            r = i['answers']
    return r
def findUserAnswerIDS(question_id, answer_items):
    r = []
    for i in answer_items:
        if i['question_id'] == question_id:
            r = i['answerids']
    return r
def processTXT(pa, ua):
    l = len(ua)
    if l >= 1:
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
   
    
    kl = len(ai)
    ul = len(ua)
    # check if the number of possible answers and user answers are the same
    if len(ai) != len(ua):
        return False
    else:
        ai.sort()
        ua.sort()
        # since both sets are arranged, compare one by one
        for i in range(len(ai)):
            if ai[i] != ua[i]:
                return False
        return True
#for when the user adds or edits the category field in a quiz
def returnTagIds(t):
    inputarray = []
    idarray = []
    namearray = []
    newnames = []
    newids = []
    res = [word.strip().lower() for word in t.split(",")]
    print(f"res is {res}")
    tagsreturn = Tag.objects.filter(name__in=res)
    for h in res:
        inputarray.append(h)
    for tag in tagsreturn:
        idarray.append(tag.id)
        namearray.append(tag.name)
    for k in inputarray:
        if k not in namearray:
            newnames.append(k)
            new = Tag(name=k)
            new.save()
            idarray.append(new.id)

    return idarray

def processSave(request, id):
    p = request.POST
        # copy the querydict to make it mutable
    g = p.copy()
    # since the form can't validate on the input values, even on empty input, remove the tag attribute
    g.pop('tag')
    # empty array for tag numbers
    tagarray = []
    # if the user input something on the field
    if p['tag']:
        # custom function to check on each of the comma separated values exist, if not, create, and then return a list of ids
        tagarray = returnTagIds(p['tag'])
        g['tag'] = tagarray
    # you can now return a form that will validate
    returndata = QuizForm(g)
    # f = { "form" : returndata , "type" : "Add", "user_id": request.user.id} 
    if returndata.is_valid():
        s = returndata.save(commit=False)
        if id:
            q = Quiz.objects.get(pk=id)
            s.created = q.created
            s.id = id
        s.owner_id = request.user.id
        s.save()
        returndata.save_m2m()
        form  = QuizForm(instance=s)
    return redirect(f"/edit/{s.id}?success=saved")

def processEditQuestion(request, questionitem, submitted):
    if (submitted['question']!=questionitem.question):
        questionitem.question = submitted['question']
        questionitem.save()
    submittedanswers = submitted['answers']
    savedanswers = questionitem.answer_item_set.all()
    for answer in submittedanswers:
        print(answer)
        if 'id' in answer:
            for savedanswer in savedanswers:
                
                if answer['id'] == savedanswer.id:
                    changed = False
                    if answer['possible_answer'] != savedanswer.possible_answer or answer['is_correct'] != savedanswer.is_correct or answer['answer_weight'] != savedanswer.answer_weight:
                        changed = True
                    
                    if changed:
                        changeditem = Answer_item(pk=answer['id'], possible_answer=answer['possible_answer'], is_correct=answer['is_correct'], answer_weight=answer['answer_weight'], question_id=questionitem.id)
                        changeditem.save()
                        # save the item
                        print('something has changed')
                # now loop over the saved items and check if all of the ids are in the submission
                matchfound = False
                for a2 in submittedanswers:
                    if 'id' in a2:
                        if savedanswer.id == a2['id']:
                            matchfound = True
                if not matchfound:
                    savedanswer.delete()
                    print('this should be deleted')

        else:
            newitem = Answer_item( possible_answer=answer['possible_answer'], is_correct=answer['is_correct'], answer_weight=answer['answer_weight'], question_id=questionitem.id)
            newitem.save()
        # this is a new item, just save it
        
        
        
    
    
    # check the question if it changed, if it did save the new question
    # after that loop through the submitted answers, sub loop through the saved ones through the id
    # if there is a match saved answer through the id, check if the values changed and save it if it did
    # if there is no match save a new answer
