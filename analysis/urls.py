from django.urls import path
from . import views

app_name = 'analysis'

urlpatterns = [
    path('analyze/', views.analyze_text, name='analyze_text'),
    path('detail/<int:analysis_id>/', views.analysis_detail, name='analysis_detail'),
    path('feedback/<int:result_id>/', views.submit_feedback, name='submit_feedback'),
    path('my-analyses/', views.my_analyses, name='my_analyses'),
    path('api/analyze/', views.api_analyze, name='api_analyze'),
]