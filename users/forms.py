from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import UserProfile


class UserRegistrationForm(UserCreationForm):
    """Form for user registration."""
    
    email = forms.EmailField(required=True)
    first_name = forms.CharField(max_length=30, required=True)
    last_name = forms.CharField(max_length=30, required=True)
    phone = forms.CharField(max_length=20, required=False)
    address = forms.CharField(widget=forms.Textarea(attrs={'rows': 3}), required=False)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password1', 'password2', 'phone', 'address')
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        
        if commit:
            user.save()
            # Create or update user profile
            UserProfile.objects.update_or_create(
                user=user,
                defaults={
                    'phone': self.cleaned_data.get('phone', ''),
                    'address': self.cleaned_data.get('address', '')
                }
            )
        return user


class UserLoginForm(forms.Form):
    """Form for user login."""
    
    username = forms.CharField(max_length=150, widget=forms.TextInput(attrs={
        'class': 'form-control',
        'placeholder': 'Username'
    }))
    password = forms.CharField(widget=forms.PasswordInput(attrs={
        'class': 'form-control',
        'placeholder': 'Password'
    }))


class UserProfileForm(forms.ModelForm):
    """Form for updating user profile."""
    
    class Meta:
        model = UserProfile
        fields = ('phone', 'address')
        widgets = {
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'address': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }


class UserUpdateForm(forms.ModelForm):
    """Form for updating user information."""
    
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={'class': 'form-control'})
    )
    first_name = forms.CharField(
        max_length=30,
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    last_name = forms.CharField(
        max_length=30,
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name')


class ForgotPasswordEmailForm(forms.Form):
    """Form to request password recovery by entering registered email."""
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'form-input-futuristic',
            'placeholder': 'Enter your registered email address',
            'style': 'padding-left: 1.5rem !important;'
        })
    )


class ForgotPasswordOTPVerifyForm(forms.Form):
    """Form to verify the secure 6-digit numeric OTP code."""
    otp_code = forms.CharField(
        max_length=6,
        min_length=6,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-input-futuristic font-monospace text-center',
            'placeholder': '• • • • • •',
            'style': 'letter-spacing: 0.5rem; font-size: 1.5rem; font-weight: bold;',
            'autocomplete': 'off'
        })
    )


class ResetPasswordForm(forms.Form):
    """Form to reset the password with validation checks."""
    password = forms.CharField(
        label="New Password",
        widget=forms.PasswordInput(attrs={
            'class': 'form-input-futuristic',
            'placeholder': 'Enter new secure password',
            'id': 'new-password'
        })
    )
    confirm_password = forms.CharField(
        label="Confirm New Password",
        widget=forms.PasswordInput(attrs={
            'class': 'form-input-futuristic',
            'placeholder': 'Confirm new password',
            'id': 'confirm-password'
        })
    )

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        confirm_password = cleaned_data.get('confirm_password')

        if password and confirm_password and password != confirm_password:
            raise forms.ValidationError("Passwords do not match.")
        return cleaned_data