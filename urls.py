from django.conf.urls.defaults import *
from django.conf import settings
from django.views.generic.simple import direct_to_template

from myPasteBin import views

import django_cron
django_cron.autodiscover()

urlpatterns = patterns('',
    (r'^$',                     direct_to_template, {'template': 'index.html'}),  
    (r'^paste/new/$',           views.create_paste),
    (r'^paste/all/$',           views.all_pastes),
    (r'^paste/search/$',        views.find_pastes),

    # static files 
    (r'^static/(?P<path>.*)$', 'django.views.static.serve',
        {'document_root': settings.BASE_DIR + '/' + 'static',
         'show_indexes': True}), 
);
