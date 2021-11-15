from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('static_test/', views.static_test, name='static_test'),
]
