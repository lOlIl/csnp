from django.http import HttpResponse,HttpResponseServerError

from datetime import datetime
from string import letters,digits
from random import choice

from models import Paste

def randString(len = 10):
    return ''.join(choice(letters + digits) for x in range(len))

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
