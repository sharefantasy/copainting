import time


# Create your models here.
import datetime
from django.db import models
from django.db.models import F


class User(models.Model):
    name = models.CharField(max_length=255)
    passw = models.CharField(max_length=255)

    @staticmethod
    def authenticate(name, pw):
        return User.objects.filter(name=name, passw=pw).exists()


class WorkSpace(models.Model):
    author = models.ForeignKey(User, related_name="response_space")
    name = models.CharField(max_length=200, null=True)
    members = models.ManyToManyField(User)
    create_time = models.DateTimeField(auto_now_add=True)
    description = models.TextField(default=None, null=True)

    @staticmethod
    def createWorkspace(**kwargs):
        w = WorkSpace.objects.create(author=kwargs['author'], name=kwargs['name'])
        if 'members' in kwargs:
            w.members = kwargs['members']
        w.members.add(w.author)
        w.save()
        return w


class Record(models.Model):
    sender = models.ForeignKey(User)
    send_time = models.DateTimeField(auto_now_add=True)
    content = models.TextField(max_length=10000)  # to be overrided.
    channel = models.ForeignKey(WorkSpace)

    class Meta:
        abstract = True


class ChatRecord(Record):
    pass


class PaintRecord(Record):
    pass