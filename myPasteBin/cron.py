from django_cron import cronScheduler, Job

from views import check_exp_time

class CheckExpiration(Job):

        # 5 mins
        run_every = 300 
                
        def job(self):
            check_exp_time()
            print 'Cron executed.'

cronScheduler.register(CheckExpiration)
