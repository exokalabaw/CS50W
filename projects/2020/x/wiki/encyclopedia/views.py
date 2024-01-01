from django.shortcuts import render, redirect
from django.http import Http404
from markdown2 import markdown
import os
from . import util


def index(request):
    par = { "entries": util.list_entries()}
    if request.GET:
        print(request.GET['error'])
        par["error"] = request.GET['error']
    print(par)   
    return render(request, "encyclopedia/index.html", par)

def entry(request, title):
    r = util.get_entry(title)
    
       
    if not r:
        raise Http404("Entry not found")
    entry = markdown(r)
    par = {"entry":entry}
    if request.GET:
        par["error"] = request.GET['error']
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





        

    
    
