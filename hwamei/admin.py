from django.contrib import admin
from hwamei import models

__author__ = 'fantasy'

admin.site.register(models.User)
admin.site.register(models.WorkSpace)
admin.site.register(models.ChatRecord)
admin.site.register(models.PaintRecord)
