from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import models
from analysis.models import AnalysisRequest, AnalysisResult
from analysis.utils import calculate_text_stats


@login_required
def dashboard(request):
    """Main dashboard view with user statistics and recent analyses."""
    
    # Get user's analyses
    user_analyses = AnalysisRequest.objects.filter(user=request.user).order_by('-created_at')[:5]
    
    # Calculate statistics
    total_analyses = AnalysisRequest.objects.filter(user=request.user).count()
    
    credible_count = AnalysisResult.objects.filter(
        analysis_request__user=request.user,
        is_credible=True
    ).count()
    
    questionable_count = AnalysisResult.objects.filter(
        analysis_request__user=request.user,
        is_credible=False
    ).count()
    
    # Recent activity
    recent_analyses = []
    for analysis in user_analyses:
        try:
            result = analysis.result
            recent_analyses.append({
                'id': analysis.id,
                'text_preview': analysis.text_content[:100] + '...' if len(analysis.text_content) > 100 else analysis.text_content,
                'category': analysis.get_category_display(),
                'score': result.credibility_score,
                'is_credible': result.is_credible,
                'created_at': analysis.created_at,
            })
        except AnalysisResult.DoesNotExist:
            pass
    
    context = {
        'total_analyses': total_analyses,
        'credible_count': credible_count,
        'questionable_count': questionable_count,
        'recent_analyses': recent_analyses,
    }
    
    return render(request, 'dashboard.html', context)


@login_required
def dashboard_stats(request):
    """View for detailed statistics page."""
    
    analyses = AnalysisRequest.objects.filter(user=request.user)
    results = AnalysisResult.objects.filter(analysis_request__user=request.user)
    
    # Calculate various statistics
    avg_score = results.aggregate(models.Avg('credibility_score'))['credibility_score__avg'] or 0
    
    # Category distribution
    category_stats = {}
    for category, label in AnalysisRequest.CATEGORY_CHOICES:
        count = analyses.filter(category=category).count()
        category_stats[label] = count
    
    # Recent scores for chart
    recent_results = results.order_by('-created_at')[:20]
    score_history = [r.credibility_score for r in recent_results]
    
    context = {
        'total_analyses': analyses.count(),
        'avg_score': round(avg_score, 2),
        'category_stats': category_stats,
        'score_history': score_history,
    }
    
    return render(request, 'dashboard_stats.html', context)