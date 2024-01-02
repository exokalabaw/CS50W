from django import template
import re
register = template.Library()

@register.filter
def dashtospace(a):
    b = a.replace("_"," ")
    return b

@register.filter
def removetitle(b):
    c = re.sub(r'^.*\n','', b)
    return c