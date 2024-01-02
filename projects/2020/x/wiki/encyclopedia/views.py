from django.shortcuts import render, redirect
from django.http import Http404
from markdown2 import markdown
import random
import os
from . import util


def index(request):
    par = { "entries": util.list_entries()}
    

    if request.GET:
        if 'error' in request.GET:
            print(request.GET['error'])
            par["error"] = request.GET['error']
        elif 'success' in request.GET:
            print(request.GET['success'])
            par["success"] = request.GET['success']
    print(par)   
    return render(request, "encyclopedia/index.html", par)

def entry(request, title):
    if title == 'rand':
        dir = 'entries'
        files = os.listdir(dir)
        l = random.choice(files)
        l =l[:-3]
        print(l)
        return redirect(f"/wiki/{l}")
    else:
        title = title.replace(" ", "_")
        r = util.get_entry(title)
        
        
        if not r:
            raise Http404("Entry not found")
        entry = markdown(r)
        par = {"entry":entry, "title":title}
        if request.GET:
            if 'error' in request.GET:
                print(request.GET['error'])
                par["error"] = request.GET['error']
            elif 'success' in request.GET:
                print(request.GET['success'])
                par["success"] = request.GET['success']
        return render(request, "encyclopedia/entry.html", par)

def search(request):
    # return render(request, "encyclopedia/errormsg.html", {"error":"you searched for nothing"})
    if request.method == "POST":
        
        query = request.POST
        querystr = query['query']
        querystring = util.get_entry(querystr)
        if query['query'] == "" :
            return redirect(f"{query['back']}?error=you+searched+for+nothing")
        elif querystring != None:
            entry = markdown (querystring)
            return redirect(f"wiki/{ querystr}")
        else:
            dir = 'entries'
            files = os.listdir(dir)
            r = []
            for file in files:
                filepath = f"{dir}/{file}"
                f = open(filepath, "r")
                content = f.read()
               
                if querystr in content:
                    title = file[:-3]
                    r.append(title)
                
                f.close()
            return render(request, "encyclopedia/search.html",{"r":r})
    else:
        return render(request, "encyclopedia/search.html")
    
def add(request):
    par = {"function":"add"}
    if request.method == "POST":
        query = request.POST
        print(query)
        
        title = query['title']
        sg = title.replace(" ", "_")
        if query['title'] == "" or query['body'] == "":
            return render(request,"encyclopedia/addedit.html", {"function":"add", "title":title, "body":query['body'],"error":"both fields must not be empty"})
        elif not util.get_entry(sg):
            body = f"# {title} \n\n {query['body']}"
            newobj = open(f"entries/{sg}.md","w+")
            newobj.write(body)
            newobj.close()
            return redirect(f"wiki/{sg}?success=Entry+added")
        else: 
            return render(request,"encyclopedia/addedit.html", {"function":"add", "title":title, "body":query['body'],"error":"entry already exists"})
    else:
        if request.GET:
            par["error"] = request.GET['error']
        return render(request,"encyclopedia/addedit.html", par)
    
def edit(request, title):
    r = util.get_entry(title)
    if request.POST:
        nolines = title.replace("_"," ")
        stuff = request.POST
        if stuff['body'] == "":
            return render(request,"encyclopedia/addedit.html", {"function":"edit", "title":title, "body":stuff['body'],"error":"body must not be empty"})

        body = f"# {nolines} \n\n{stuff['body']}"
        print(f"{len(r)}")
        print(f"{len(body)}")
        
        if r == body:
            print("is this going in jdklsa jdalsjdal")
            return render(request,"encyclopedia/addedit.html", {"function":"edit", "title":title, "body":stuff['body'],"error":"nothing changed"})
        else:
            newobj = open(f"entries/{title}.md","w+")
            newobj.write(body)
            newobj.close()
            return redirect(f"/wiki/{ title }?success=entry+saved")    
    else:
        
        if not r:
            raise Http404("Entry not found")
        par = {"function":"edit", "title":title, "body":r}
        if request.GET:
            if 'error' in request.GET:
                print(request.GET['error'])
                par["error"] = request.GET['error']
            elif 'success' in request.GET:
                print(request.GET['success'])
                par["success"] = request.GET['success']
        
        return render(request,"encyclopedia/addedit.html", par)    


def error404(request, exception):
    return render(request, 'encyclopedia/404.html',status=404)


        

    
    
