from django.db import models

class Paste(models.Model):
    weblink     =   models.CharField(max_length=50, primary_key=True)
    nickname    =   models.CharField(max_length=50)
    title       =   models.CharField(max_length=50)
    text        =   models.TextField()
    exp_time    =   models.DateTimeField()
    pub_time    =   models.DateTimeField(auto_now_add = True)
 
    def __unicode__(self):
        return self.weblink
