from django.conf.urls import patterns, url

__author__ = 'fantasy'

urlpatterns = patterns('',
    url(r'^comserver/$', 'hwamei.views.comserver',name="comserver"),

    url(r'^check_login/$', 'hwamei.views.login', name='checklogin'),
    url(r'^register/$', 'hwamei.views.register', name='register'),
    url(r'^check_register/$', 'hwamei.views.check_register', name='check_register'),
    url(r'^logout/$', 'hwamei.views.logout', name='logout'),

    url(r'^$', 'hwamei.views.index', name='index'),
    url(r'^main/(\w+)$', 'hwamei.views.main',name='main'),
    url(r'^manage/$', 'hwamei.views.manage',name='manage'),
    url(r'^invite/$', 'hwamei.views.invite', name='invite'),

    url(r'^add_member/(\w+)/$', 'hwamei.views.addMember', name='add_member'),
    url(r'^create_ws/$', 'hwamei.views.createWS', name='create_ws'),


    url(r'^ad/$', 'hwamei.views.ad',name='ad'),
)