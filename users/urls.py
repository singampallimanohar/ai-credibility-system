from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('history/', views.analysis_history, name='analysis_history'),
    path('auth/social/<str:provider>/', views.social_login_sim, name='social_login_sim'),
    path('forgot-password/', views.forgot_password_request, name='forgot_password_request'),
    path('forgot-password/verify/', views.forgot_password_verify, name='forgot_password_verify'),
    path('forgot-password/reset/', views.forgot_password_reset, name='forgot_password_reset'),
]