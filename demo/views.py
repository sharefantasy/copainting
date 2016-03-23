# -*coding:utf8*-
from demo.models import Comments, User

from django.shortcuts import render
from django.http import HttpResponse, HttpResponseServerError
from django.views.decorators.csrf import csrf_exempt
from django.contrib.sessions.models import Session
from django.contrib.auth.decorators import login_required

import redis


@login_required
def home(request):
    comments = Comments.objects.select_related().all()[0:100]
    return render(request, '../Comserver/views/index.html', locals())


@csrf_exempt
def node_api(request):
    try:
        #通过sessionid获得 user
        session = Session.objects.get(session_key=request.POST.get('sessionid'))
        user_id = session.get_decoded().get('_auth_user_id')
        user = User.objects.get(id=user_id)

        #创建Comment
        # Comments.objects.create(user=user, text=request.POST.get('comment'))
        
        #创建后就把它发送到聊天室
        r = redis.StrictRedis(host='localhost', port=6379, db=0)
        r.publish('chat', user.username + ': ' + request.POST.get('comment'))
        
        return HttpResponse("Everything worked :)")
    except Exception, e:
        return HttpResponseServerError(str(e))