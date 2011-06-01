from django.conf.urls.defaults import *
from django.conf import settings
from django.views.generic.simple import direct_to_template

from myPasteBin.views import create_paste

urlpatterns = patterns('',
    (r'^$', direct_to_template, {'template': 'index.html'}),
    (r'^paste/new/$', create_paste),

    # static files 
    (r'^static/(?P<path>.*)$', 'django.views.static.serve',
        {'document_root': settings.BASE_DIR + '/' + 'static',
         'show_indexes': True}), 
)
