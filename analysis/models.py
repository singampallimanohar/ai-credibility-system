from django.db import models
from django.contrib.auth.models import User


class AnalysisRequest(models.Model):
    """Model to store analysis requests."""
    
    CATEGORY_CHOICES = [
        ('news', 'News Article'),
        ('social', 'Social Media Post'),
        ('review', 'Product Review'),
        ('article', 'Blog Article'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analysis_requests')
    text_content = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    source_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Analysis #{self.id} by {self.user.username}"


class AnalysisResult(models.Model):
    """Model to store analysis results."""
    
    analysis_request = models.OneToOneField(
        AnalysisRequest, 
        on_delete=models.CASCADE, 
        related_name='result'
    )
    credibility_score = models.FloatField()
    confidence_level = models.CharField(max_length=50)
    is_credible = models.BooleanField()
    factors = models.JSONField(default=dict)
    recommendations = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Result for Analysis #{self.analysis_request.id}"


class Feedback(models.Model):
    """Model for user feedback on analysis results."""
    
    RATING_CHOICES = [
        (1, 'Very Inaccurate'),
        (2, 'Inaccurate'),
        (3, 'Neutral'),
        (4, 'Accurate'),
        (5, 'Very Accurate'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedbacks')
    analysis_result = models.ForeignKey(AnalysisResult, on_delete=models.CASCADE, related_name='feedbacks')
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Feedback by {self.user.username} on Result #{self.analysis_result.id}"