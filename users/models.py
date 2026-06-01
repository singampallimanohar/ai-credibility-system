from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """Extended user profile for the credibility system."""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"


class AnalysisHistory(models.Model):
    """Track user's analysis history."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analysis_history')
    input_text = models.TextField()
    credibility_score = models.FloatField()
    confidence_level = models.CharField(max_length=50)
    is_credible = models.BooleanField()
    analyzed_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Analysis by {self.user.username} on {self.analyzed_at.strftime('%Y-%m-%d %H:%M')}"


from django.utils import timezone

class ForgotPasswordOTP(models.Model):
    """Model to store OTP codes for password recovery verification."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_otps')
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=timezone.now)
    is_verified = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)

    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"OTP Code ({self.otp_code}) for {self.user.username}"