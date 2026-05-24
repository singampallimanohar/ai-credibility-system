from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.views import LoginView
from .forms import UserRegistrationForm, UserLoginForm, UserProfileForm, UserUpdateForm
from .models import UserProfile, AnalysisHistory


def home(request):
    """Home page - redirects to dashboard or login."""
    if request.user.is_authenticated:
        return redirect('dashboard')
    return redirect('login')


def register(request):
    """Handle user registration."""
    
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Registration successful! Welcome to Credibility System.')
            return redirect('dashboard')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = UserRegistrationForm()
    
    return render(request, 'register.html', {'form': form})


def login_view(request):
    """Handle user login."""
    
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    if request.method == 'POST':
        form = UserLoginForm(request.POST)
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            messages.success(request, f'Welcome back, {user.username}!')
            return redirect('dashboard')
        else:
            messages.error(request, 'Invalid username or password.')
    else:
        form = UserLoginForm()
    
    return render(request, 'login.html', {'form': form})


def logout_view(request):
    """Handle user logout."""
    
    logout(request)
    messages.info(request, 'You have been logged out successfully.')
    return redirect('login')


@login_required
def profile(request):
    """View and update user profile."""
    
    user = request.user
    
    try:
        profile_instance = user.profile
    except UserProfile.DoesNotExist:
        profile_instance = UserProfile.objects.create(user=user)
        
    if request.method == 'POST':
        user_form = UserUpdateForm(request.POST, instance=user)
        profile_form = UserProfileForm(request.POST, instance=profile_instance)
        
        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save()
            messages.success(request, 'Profile updated successfully!')
            return redirect('profile')
    else:
        user_form = UserUpdateForm(instance=user)
        profile_form = UserProfileForm(instance=profile_instance)
    
    # Get analysis history
    history = AnalysisHistory.objects.filter(user=user).order_by('-analyzed_at')[:10]
    
    context = {
        'user_form': user_form,
        'profile_form': profile_form,
        'history': history
    }
    return render(request, 'profile.html', context)


@login_required
def analysis_history(request):
    """View user's analysis history."""
    
    history = AnalysisHistory.objects.filter(user=request.user).order_by('-analyzed_at')
    
    context = {
        'history': history
    }
    return render(request, 'analysis_history.html', context)


def social_login_sim(request, provider):
    """Simulates social login using Google/GitHub in a sandbox environment."""
    from django.contrib.auth.models import User
    
    # Try to find a user or create a premium sandbox user
    username = f"sandbox_{provider}"
    email = f"{provider}_user@credibility.ai"
    
    user, created = User.objects.get_or_create(username=username, defaults={'email': email})
    if created:
        user.set_unusable_password()
        user.save()
        
    login(request, user)
    messages.success(request, f'Successfully authenticated via {provider.capitalize()}! Welcome to the AI Platform.')
    return redirect('dashboard')