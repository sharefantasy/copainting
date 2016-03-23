# coding=utf-8
# Create your views here.
import json
from django.contrib.auth import get_user
from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
import socket
from hwamei.models import Record, User, WorkSpace, PaintRecord, ChatRecord
from hwamei.widgets import Palette


def ad(request):
    u = get_user(request)
    serverIP = socket.gethostbyname(socket.gethostname())
    port = 3000
    user_name = u.username
    workspace = "ss"
    return render(request, "test.html", locals())


@csrf_exempt
def comserver(request):
    record = json.loads(request.POST.get('record'))

    if record['event'] == 'rcv_draw':
        rec = PaintRecord
    elif record['event'] == 'rcv_chat':
        rec = ChatRecord
    else:
        raise Http404
    sender = User.objects.get(name=record['user'])
    ws = WorkSpace.objects.get(pk=int(record['worksp']))
    print ws.author
    rec.objects.create(sender=sender, content=record['content'], channel=ws)
    return HttpResponse("success")


def index(request):
    if login(request):
        return HttpResponseRedirect(reverse("hwamei:manage"))
    title = u"首页"
    if 'error' in request.session:
        error = request.session['error']
        del request.session['error']
    return render(request, 'index.html', locals())


def login(request):
    if request.session.get('username', '') != "" and request.session.get('passw', "") != "":
        return User.authenticate(request.session['username'], request.session['passw'])
    if (request.POST.get('username', "") == "") or (request.POST.get('passw', "") == ""):
        return False
    username = request.POST.get('username')
    passw = request.POST.get('passw')
    if username is not None and passw is not None:
        if User.authenticate(username, passw):
            request.session['username'] = username
            request.session['passw'] = passw
        return True
    return False


def main(request, ws):
    if not login(request):
        return HttpResponseRedirect(reverse('hwamei:index'))
    title = u"画板"
    serverIP = socket.gethostbyname(socket.gethostname())
    port = 3000
    user = User.objects.get(name=request.session['username'], passw=request.session['passw'])
    workspace = user.workspace_set.get(pk=ws)
    palette = Palette().colors
    return render(request, 'main.html', locals())


def manage(request):
    if not login(request):
        return HttpResponseRedirect(reverse('hwamei:index'))
    username = request.session['username']
    passw = request.session['passw']
    user = User.objects.get(name=username, passw=passw)
    workspaces = user.workspace_set.all()
    return render(request, "manage.html", locals())


def logout(request):
    try:
        del request.session['username']
        del request.session['passw']
    except KeyError:
        pass
    return HttpResponseRedirect(reverse('hwamei:index'))


def register(request):
    title = u"注册"
    if 'error' in request.session:
        error = request.session['error']
        del request.session['error']
    return render(request, 'register.html', locals())


def check_register(request):
    username = request.POST['username']
    passw = request.POST['passw']

    if User.objects.filter(name=username).exists():
        request.session['error'] = "用户已存在"
        return HttpResponseRedirect(reverse('hwamei:register'))
    request.session['username'] = username
    request.session['passw'] = passw
    u = User.objects.create(name=username, passw=passw)
    u.save()
    return HttpResponseRedirect(reverse('hwamei:manage'))


def invite(request):
    if not login(request):
        return HttpResponseRedirect(reverse('hwamei:index'))
    user = User.objects.get(name=request.session['username'], passw=request.session['passw'])
    return render(request, 'invite.html', locals())


def createWS(request):
    if not login(request):
        raise Http404
    ws_members = json.loads(request.POST.get('ws_data'))
    ws_name = request.POST.get('ws_name')
    user = User.objects.get(name=request.session['username'])
    members = []
    for member in ws_members:
        members.append(User.objects.get(name=member))
    try:
        w = WorkSpace.createWorkspace(name=ws_name, author=user, members=members)
    except KeyError:
        raise Http404
    return HttpResponseRedirect(reverse('hwamei:main', args=[w.id]))


def addMember(request, mem_name):
    if not login(request):
        raise Http404

    if request.session['username'] == mem_name:
        ret = "不能添加自己"

    elif User.objects.filter(name=mem_name).exists():
        ret = "success"
    else:
        ret = u"用户'" + mem_name + u"'不存在"
    return HttpResponse(ret)