from django.conf.urls.defaults import *
from django.conf import settings
from django.views.generic.simple import direct_to_template

from myPasteBin.views import create_paste, all_pastes, find_pastes

urlpatterns = patterns('',
    (r'^$', direct_to_template, {'template': 'index.html'}),
    (r'^paste/new/$', create_paste),
    (r'^paste/all/$', all_pastes),
    (r'^paste/search/$', find_pastes),

    # static files 
    (r'^static/(?P<path>.*)$', 'django.views.static.serve',
        {'document_root': settings.BASE_DIR + '/' + 'static',
         'show_indexes': True}), 
)
