from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('stats/', views.dashboard_stats, name='dashboard_stats'),
]