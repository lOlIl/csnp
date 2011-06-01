from django.http import HttpRequest, HttpResponse, HttpResponseServerError
from django.utils import simplejson
from django.db.models import Q

from datetime import datetime
from string import letters,digits
from random import choice

from models import Paste

def randString(len = 10):
    return ''.join(choice(letters + digits) for x in range(len))

def _json_datetime(d):
    return d.strftime("%d-%m-%Y %H:%M")

def _json_link(l):
    return '/paste/detail/'+l

def json_list(valueset):
    data = [dict(v, **{'weblink':_json_link(v['weblink']),'pub_time':_json_datetime(v['pub_time']),'exp_time': _json_datetime(v['exp_time'])}) for v in valueset] 
    json = simplejson.dumps({'items': data})
    return json 

###

def check_exp_time():
    Paste.objects.filter(exp_time__lt = datetime.now()).delete()    

def find_pastes(request):
    error_msg = u"No data sent."
    if request.method == "GET" and request.GET.has_key('find'):
        toFind = request.GET['find']
        # search style 3 in 1   
        NOW = datetime.now()  
        if request.GET.has_key('title'):
            valueset =  Paste.objects.filter(Q(title = toFind),Q(exp_time__gt=NOW)).values()
        elif request.GET.has_key('author'):
            valueset =  Paste.objects.filter(Q(nickname = toFind),Q(exp_time__gt=NOW)).values()
        else:      
            valueset =  Paste.objects.filter(Q(nickname = toFind)|Q(title = toFind),Q(exp_time__gt=NOW)).values()
        return HttpResponse(json_list(valueset), mimetype='text/javascript') 
    return HttpResponseServerError(error_msg) 

def all_pastes(request):
    valueset = Paste.objects.values()
    return HttpResponse(json_list(valueset), mimetype='text/javascript')

def create_paste(request):
    error_msg = u"No data sent."
    if request.method == "GET":
        get = request.GET.copy()
        if get.has_key('title') and get.has_key('text') and get.has_key('nickname') and get.has_key('exp_time'):
            ttl = get['title']
            txt = get['text']
            usr = get['nickname']
            exp = datetime.strptime(get['exp_time'],'%d/%m/%Y %H:%M')           

            if Paste.objects.filter(title=ttl).count() > 0:
                error_msg = u"Title already in use."
            else:
                p = Paste(randString(15),usr,ttl,txt,exp)
                p.save()
                return HttpResponse(str(1))
        else:
            error_msg = u"Insufficient data"
    return HttpResponseServerError(error_msg) 
