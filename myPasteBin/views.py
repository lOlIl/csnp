from django.http import HttpRequest, HttpResponse, HttpResponseServerError
from django.utils import simplejson
from django.db.models import Q
from django.shortcuts import render_to_response

from datetime import datetime
from string import letters,digits
from random import choice

from models import Paste

def randString(length = 10):
    original = False
    while(not original):
        original_link = ''.join(choice(letters + digits) for x in range(length))
        if len(Paste.objects.filter(weblink = original_link)) == 0:
            original = True    
    return original_link

def _json_datetime(d):
    return d.strftime("%d-%m-%Y %H:%M")

def _json_link(l):
    return '/paste/detail/'+l

def json_list(valueset):
    data = [dict(v, **{'weblink':_json_link(v['weblink']),'pub_time':_json_datetime(v['pub_time']),'exp_time': _json_datetime(v['exp_time'])}) for v in valueset] 
    json = simplejson.dumps({'items': data})
    return json 

###

def detail(request, weblink):
    paste = Paste.objects.filter(weblink = weblink).values()
    return HttpResponse(json_list(paste), mimetype='text/javascript') 
    
def check_exp_time():
    Paste.objects.filter(exp_time__lt = datetime.now()).delete()    

def find_pastes(request):
    error_msg = u"No data sent."
    if request.method == "GET" and request.GET.has_key('find'):
        toFind = request.GET['find']
        # search style 3 in 1   
        NOW = datetime.now()  
        if request.GET.has_key('title'):    # searching for title
            valueset =  Paste.objects.filter(Q(title = toFind),Q(exp_time__gt=NOW)).values('weblink','title','pub_time','exp_time','nickname')
        elif request.GET.has_key('author'): # searching for author
            valueset =  Paste.objects.filter(Q(nickname = toFind),Q(exp_time__gt=NOW)).values('weblink','title','pub_time','exp_time','nickname')
        else:      
            valueset =  Paste.objects.filter(Q(nickname = toFind)|Q(title = toFind),Q(exp_time__gt=NOW)).values('weblink','title','pub_time','exp_time','nickname')
        return HttpResponse(json_list(valueset), mimetype='text/javascript') 
    return HttpResponseServerError(error_msg) 

def all_pastes(request):
    valueset = Paste.objects.values('weblink','title','pub_time','exp_time','nickname')
    return HttpResponse(json_list(valueset), mimetype='text/javascript')

def create_paste(request):
    error_msg = u"No data sent."
    if request.method == "GET":
        get = request.GET.copy()
        if get.has_key('title') and get.has_key('text') and get.has_key('nickname') and get.has_key('exp_time'):
            ttl = get['title']
            txt = get['text']
            usr = get['nickname']

            try:
                exp = datetime.strptime(get['exp_time'],'%d/%m/%Y %H:%M')           
            except:
                msg = 2

            if len(txt) > 100000: # utf-8 100kB
                msg = 0
            else:
                p = Paste(randString(15),usr,ttl,txt,exp)
                p.save()
                msg = 1
            return HttpResponse(msg)
        else:
            error_msg = u"Insufficient data"
    return HttpResponseServerError(error_msg) 
