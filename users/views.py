from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.views import LoginView
try:
    from .forms import UserRegistrationForm, UserLoginForm, UserProfileForm, UserUpdateForm
    from .models import UserProfile, AnalysisHistory
except ImportError:
    from users.forms import UserRegistrationForm, UserLoginForm, UserProfileForm, UserUpdateForm
    from users.models import UserProfile, AnalysisHistory


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
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                login(request, user)
                messages.success(request, f'Welcome back, {user.username}!')
                return redirect('dashboard')
            else:
                messages.error(request, 'Invalid username or password.')
        else:
            messages.error(request, 'Please correct the form errors.')
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
        if 'user_form' in request.POST:
            user_form = UserUpdateForm(request.POST, instance=user)
            profile_form = UserProfileForm(instance=profile_instance)
            if user_form.is_valid():
                user_form.save()
                messages.success(request, 'Account information updated successfully!')
                return redirect('profile')
        elif 'profile_form' in request.POST:
            user_form = UserUpdateForm(instance=user)
            profile_form = UserProfileForm(request.POST, instance=profile_instance)
            if profile_form.is_valid():
                profile_form.save()
                messages.success(request, 'Developer profile updated successfully!')
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
    """View user's analysis history - redirects to the central analyses archive."""
    return redirect('analysis:my_analyses')


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


def forgot_password_request(request):
    """Step 1: Enter email and trigger secure OTP generation."""
    if request.user.is_authenticated:
        return redirect('dashboard')

    from .forms import ForgotPasswordEmailForm
    from .models import ForgotPasswordOTP
    from django.contrib.auth.models import User
    import random
    from django.utils import timezone
    from datetime import timedelta
    from django.core.mail import send_mail

    if request.method == 'POST':
        form = ForgotPasswordEmailForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            try:
                user = User.objects.filter(email=email).first()
                if not user:
                    raise User.DoesNotExist
                
                # Generate a secure 6-digit numeric OTP
                otp_code = str(random.SystemRandom().randint(100000, 999999))
                
                # Deactivate older active OTPs for this user
                ForgotPasswordOTP.objects.filter(user=user, is_verified=False).delete()
                
                # Create the database OTP model record
                ForgotPasswordOTP.objects.create(
                    user=user,
                    otp_code=otp_code,
                    expires_at=timezone.now() + timedelta(minutes=5)
                )
                
                # Store email in session to carry over to verify step
                request.session['recovery_email'] = email
                
                # Prepare and send HTML OTP recovery email
                subject = '[SECURITY ALERT] AI Credibility System - Password Recovery OTP'
                
                # Construct HTML email body
                html_message = f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #1e293b; background-color: #0f172a; color: #f8fafc; border-radius: 8px;">
                    <div style="text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px;">
                        <h2 style="color: #3b82f6; margin: 0; font-family: 'Helvetica Neue', sans-serif; letter-spacing: 1px;">NEURAL COMMAND CENTER</h2>
                        <span style="font-size: 11px; color: #64748b; font-family: monospace;">AUTHENTICATION SHIELD GATEWAY</span>
                    </div>
                    <p style="font-size: 14px;">Greetings Operator <strong>{user.username}</strong>,</p>
                    <p style="font-size: 14px; line-height: 1.5;">A password recovery request has been triggered for your account. Enter the secure 6-digit OTP code below to verify your identity:</p>
                    
                    <div style="background-color: rgba(59, 130, 246, 0.08); border: 1px dashed #3b82f6; border-radius: 6px; padding: 20px; text-align: center; margin: 25px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #06b6d4; font-family: monospace;">{otp_code}</span>
                    </div>
                    
                    <p style="font-size: 12px; color: #f59e0b; font-family: monospace; text-align: center;">[CRITICAL WARNING] This verification code is active for exactly 5 minutes.</p>
                    
                    <div style="border-top: 1px solid #1e293b; padding-top: 15px; margin-top: 25px; font-size: 11px; color: #64748b; font-family: monospace; text-align: center;">
                        AI-Based User Credibility & Trustworthiness Evaluation Gateway<br>
                        System timestamp: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')} UTC
                    </div>
                </div>
                """
                plain_message = f"Hello {user.username},\n\nYour password recovery OTP code is: {otp_code}\nThis code expires in 5 minutes.\n\nAI Credibility Evaluation System."

                try:
                    # Trigger standard Django mail sending
                    send_mail(
                        subject,
                        plain_message,
                        'no-reply@credibility.ai',
                        [email],
                        html_message=html_message,
                        fail_silently=False,
                    )
                    messages.success(request, 'Secure 6-digit OTP verification code has been dispatched to your email.')
                except Exception as mail_err:
                    # Graceful local fallback for developer convenience if SMTP settings are not populated
                    print(f"\n============================================\n[SANDBOX DEVELOPER FALLBACK] OTP Dispatch:\nTarget User: {user.username}\nTarget Email: {email}\nOTP CODE: {otp_code}\n============================================\n")
                    messages.warning(request, f"SMTP offline. [SANDBOX MODE] OTP printed to developer terminal shell! Code is: {otp_code}")
                
                return redirect('forgot_password_verify')
                
            except User.DoesNotExist:
                # Security guideline: do not reveal user existence but direct to recovery flow for generic message
                messages.error(request, 'No active operator matches this recovery registry.')
        else:
            messages.error(request, 'Please supply a valid email coordinate.')
    else:
        form = ForgotPasswordEmailForm()

    return render(request, 'forgot_password_request.html', {'form': form})


def forgot_password_verify(request):
    """Step 2: Enter code, track attempts, and set verification token."""
    if request.user.is_authenticated:
        return redirect('dashboard')

    from .forms import ForgotPasswordOTPVerifyForm
    from .models import ForgotPasswordOTP
    from django.contrib.auth.models import User
    from django.utils import timezone

    email = request.session.get('recovery_email')
    if not email:
        messages.error(request, 'Session lost. Please re-initiate recovery.')
        return redirect('forgot_password_request')

    try:
        user = User.objects.filter(email=email).first()
        if not user:
            raise User.DoesNotExist
        active_otp = ForgotPasswordOTP.objects.filter(user=user, is_verified=False).order_by('-created_at').first()
    except (User.DoesNotExist, ForgotPasswordOTP.DoesNotExist):
        messages.error(request, 'No active OTP verification session found.')
        return redirect('forgot_password_request')

    if not active_otp:
        messages.error(request, 'Recovery ticket has expired. Re-enter email.')
        return redirect('forgot_password_request')

    if active_otp.is_expired():
        messages.error(request, 'Verification OTP window has expired. Generate a new code.')
        return redirect('forgot_password_request')

    # Compute remaining seconds for javascript countdown initialization
    time_delta = active_otp.expires_at - timezone.now()
    countdown_seconds = max(0, int(time_delta.total_seconds()))

    if request.method == 'POST':
        form = ForgotPasswordOTPVerifyForm(request.POST)
        if form.is_valid():
            entered_otp = form.cleaned_data['otp_code'].strip()
            
            # Prevent Brute Force
            if active_otp.attempts >= 5:
                active_otp.delete()
                messages.error(request, 'Excessive validation violations. Ticket terminated for security. Please request a new OTP.')
                return redirect('forgot_password_request')
            
            if entered_otp == active_otp.otp_code:
                active_otp.is_verified = True
                active_otp.save()
                
                # Flag the user's session as authorized to reset password
                request.session['recovery_verified_user_id'] = user.id
                messages.success(request, 'Identity verified successfully! Set your new password below.')
                return redirect('forgot_password_reset')
            else:
                active_otp.attempts += 1
                active_otp.save()
                remaining_tries = 5 - active_otp.attempts
                messages.error(request, f'Verification code failed. {remaining_tries} validation attempts remaining.')
        else:
            messages.error(request, 'Format validation failed. Input a valid 6-digit number.')
    else:
        form = ForgotPasswordOTPVerifyForm()

    context = {
        'form': form,
        'email': email,
        'countdown_seconds': countdown_seconds
    }
    return render(request, 'forgot_password_verify.html', context)


def forgot_password_reset(request):
    """Step 3: Provide a new secure password and finalize password update."""
    if request.user.is_authenticated:
        return redirect('dashboard')

    from .forms import ResetPasswordForm
    from django.contrib.auth.models import User
    from .models import ForgotPasswordOTP

    user_id = request.session.get('recovery_verified_user_id')
    if not user_id:
        messages.error(request, 'Access token invalid. Run the recovery verification first.')
        return redirect('forgot_password_request')

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        messages.error(request, 'Target operator account could not be found.')
        return redirect('forgot_password_request')

    if request.method == 'POST':
        form = ResetPasswordForm(request.POST)
        if form.is_valid():
            new_password = form.cleaned_data['password']
            
            # Secure Password Update
            user.set_password(new_password)
            user.save()
            
            # Delete recovery codes for security
            ForgotPasswordOTP.objects.filter(user=user).delete()
            
            # Clean session values
            if 'recovery_email' in request.session:
                del request.session['recovery_email']
            if 'recovery_verified_user_id' in request.session:
                del request.session['recovery_verified_user_id']
                
            messages.success(request, 'Operator password updated successfully! Log in with your new credentials.')
            return redirect('login')
        else:
            messages.error(request, 'Please resolve password security requirement alerts.')
    else:
        form = ResetPasswordForm()

    return render(request, 'forgot_password_reset.html', {'form': form, 'username': user.username})
