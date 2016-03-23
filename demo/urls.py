from django.conf.urls import patterns, url

__author__ = 'FanTasY'

urlpatterns = patterns('',
    url(r'^$', 'demo.views.home', name='home'),
    url(r'^node_api/$', 'demo.views.node_api', name='node_api'),
    url(r'^login/$', 'django.contrib.auth.views.login', {'template_name': 'admin/login.html'}, name='login'),
    url(r'^logout/$', 'django.contrib.auth.views.logout', {'next_page': '/'}, name='logout'),
)
