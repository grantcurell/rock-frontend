pythonpath = "/opt/rock-frontend/backend/"
bind = "127.0.0.1:5001"
worker_class = "gevent"
workers = 1 
loglevel = "debug"
accesslog = "/var/log/rock/gunicorn_access.log" 
errorlog = "/var/log/rock/gunicorn_error.log"