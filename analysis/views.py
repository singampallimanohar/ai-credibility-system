from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import AnalysisRequest, AnalysisResult, Feedback
from .ml_model import analyzer
from .utils import (
    validate_text_input, 
    extract_urls, 
    calculate_text_stats,
    format_credibility_result,
    sanitize_input
)


FEEDBACK_CHOICES = [
    (1, 'Very Inaccurate'),
    (2, 'Inaccurate'),
    (3, 'Neutral'),
    (4, 'Accurate'),
    (5, 'Very Accurate'),
]


@login_required
def analyze_text(request):
    """View for analyzing text content."""
    
    if request.method == 'POST':
        text_content = request.POST.get('text_content', '')
        category = request.POST.get('category', 'other')
        source_url = request.POST.get('source_url', '')
        
        # Validate input
        is_valid, error_message = validate_text_input(text_content)
        
        if not is_valid:
            messages.error(request, error_message)
            return redirect('dashboard')
        
        # Sanitize input
        text_content = sanitize_input(text_content)
        
        # Create analysis request
        analysis_request = AnalysisRequest.objects.create(
            user=request.user,
            text_content=text_content,
            category=category,
            source_url=source_url if source_url else None
        )
        
        # Run analysis
        result = analyzer.analyze(text_content)
        
        # Create analysis result
        analysis_result = AnalysisResult.objects.create(
            analysis_request=analysis_request,
            credibility_score=result['score'],
            confidence_level=result['confidence'],
            is_credible=result['is_credible'],
            factors=result['factors'],
            recommendations=result['recommendations']
        )
        
        # Format result for display
        formatted_result = format_credibility_result(result)
        
        # Also save to user's history in users app
        from users.models import AnalysisHistory
        AnalysisHistory.objects.create(
            user=request.user,
            input_text=text_content[:200] + ('...' if len(text_content) > 200 else ''),
            credibility_score=result['score'],
            confidence_level=result['confidence'],
            is_credible=result['is_credible']
        )
        
        context = {
            'result': formatted_result,
            'request': analysis_request,
            'stats': calculate_text_stats(text_content),
            'urls': extract_urls(text_content),
            'feedback_choices': FEEDBACK_CHOICES,
        }
        
        return render(request, 'results.html', context)
    
    return redirect('dashboard')


@login_required
def analysis_detail(request, analysis_id):
    """View for displaying a specific analysis result."""
    
    analysis_request = get_object_or_404(AnalysisRequest, id=analysis_id, user=request.user)
    analysis_result = analysis_request.result
    
    result = {
        'score': analysis_result.credibility_score,
        'confidence': analysis_result.confidence_level,
        'is_credible': analysis_result.is_credible,
        'factors': analysis_result.factors,
        'recommendations': analysis_result.recommendations,
    }
    
    formatted_result = format_credibility_result(result)
    
    context = {
        'result': formatted_result,
        'request': analysis_request,
        'stats': calculate_text_stats(analysis_request.text_content),
        'urls': extract_urls(analysis_request.text_content),
        'feedback_choices': FEEDBACK_CHOICES,
    }
    
    return render(request, 'results.html', context)


@login_required
def submit_feedback(request, result_id):
    """View for submitting feedback on analysis results."""
    
    if request.method == 'POST':
        result = get_object_or_404(AnalysisResult, id=result_id)
        
        rating = request.POST.get('rating')
        comment = request.POST.get('comment', '')
        
        if not rating:
            messages.error(request, 'Please select a rating.')
            return redirect('analysis:analysis_detail', analysis_id=result.analysis_request.id)
        
        # Create feedback
        Feedback.objects.create(
            user=request.user,
            analysis_result=result,
            rating=int(rating),
            comment=comment
        )
        
        messages.success(request, 'Thank you for your feedback!')
        
        return redirect('analysis:analysis_detail', analysis_id=result.analysis_request.id)
    
    return redirect('dashboard')


@login_required
def my_analyses(request):
    """View for displaying user's analysis history."""
    
    analyses = AnalysisRequest.objects.filter(user=request.user).order_by('-created_at')
    
    # Calculate statistics
    total_analyses = analyses.count()
    credible_count = AnalysisResult.objects.filter(
        analysis_request__user=request.user,
        is_credible=True
    ).count()
    
    context = {
        'analyses': analyses,
        'total_analyses': total_analyses,
        'credible_count': credible_count,
    }
    
    return render(request, 'my_analyses.html', context)


@csrf_exempt
def api_analyze(request):
    """API endpoint for quick text analysis (JSON)."""
    
    if request.method == 'POST':
        import json
        
        try:
            data = json.loads(request.body)
            text_content = data.get('text_content', '')
            
            # Validate input
            is_valid, error_message = validate_text_input(text_content)
            
            if not is_valid:
                return JsonResponse({
                    'success': False,
                    'error': error_message
                }, status=400)
            
            # Run analysis
            result = analyzer.analyze(text_content)
            formatted_result = format_credibility_result(result)
            
            return JsonResponse({
                'success': True,
                'result': formatted_result
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON format'
            }, status=400)
    
    return JsonResponse({
        'success': False,
        'error': 'Only POST method allowed'
    }, status=405)