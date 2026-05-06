/**
 * Credibility Analysis System - Main JavaScript
 * Contains utility functions, form handling, and interactive features
 */

// ============================================
// Document Ready Function
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initAlerts();
    initFormValidation();
    initLoadingButtons();
    initTooltips();
    initAnimations();
    initSidebar();
});


// ============================================
// Alert Handling
// ============================================
function initAlerts() {
    const alerts = document.querySelectorAll('.alert');
    
    alerts.forEach(alert => {
        // Auto-dismiss alerts after 5 seconds
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
        
        // Add click handler to close button
        const closeBtn = alert.querySelector('.btn-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            });
        }
    });
}


// ============================================
// Form Validation
// ============================================
function initFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
        
        // Real-time validation for input fields
        const inputs = form.querySelectorAll('.form-control, .form-select');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                if (this.checkValidity()) {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                } else {
                    this.classList.remove('is-valid');
                }
            });
            
            input.addEventListener('blur', function() {
                if (this.value.length > 0 && !this.checkValidity()) {
                    this.classList.add('is-invalid');
                }
            });
        });
    });
    
    // Password strength checker
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        if (input.id === 'id_password1' || input.name === 'password1') {
            input.addEventListener('input', function() {
                checkPasswordStrength(this.value);
            });
        }
    });
}

function checkPasswordStrength(password) {
    const strengthIndicator = document.getElementById('password-strength');
    if (!strengthIndicator) return;
    
    let strength = 0;
    let feedback = '';
    
    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
    if (password.match(/\d/)) strength += 1;
    if (password.match(/[^a-zA-Z\d]/)) strength += 1;
    
    switch(strength) {
        case 0:
        case 1:
            feedback = '<span class="text-danger">Weak</span>';
            break;
        case 2:
            feedback = '<span class="text-warning">Medium</span>';
            break;
        case 3:
        case 4:
            feedback = '<span class="text-success">Strong</span>';
            break;
    }
    
    strengthIndicator.innerHTML = feedback;
}


// ============================================
// Loading Button States
// ============================================
function initLoadingButtons() {
    const buttons = document.querySelectorAll('[data-loading]');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const originalText = this.innerHTML;
            const loadingText = this.getAttribute('data-loading') || 'Loading...';
            
            // Store original text as data attribute
            this.setAttribute('data-original-text', originalText);
            this.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span>${loadingText}`;
            this.disabled = true;
            
            // Re-enable after 10 seconds as fallback
            setTimeout(() => {
                this.innerHTML = originalText;
                this.disabled = false;
            }, 10000);
        });
    });
    
    // Form submission loading state
    const submitButtons = document.querySelectorAll('button[type="submit"], input[type="submit"]');
    submitButtons.forEach(button => {
        const form = button.closest('form');
        if (form) {
            form.addEventListener('submit', function() {
                button.disabled = true;
                const originalText = button.innerHTML;
                button.setAttribute('data-original-text', originalText);
                button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Processing...';
                
                // Re-enable after 30 seconds as fallback
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 30000);
            });
        }
    });
}


// ============================================
// Tooltips Initialization
// ============================================
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}


// ============================================
// Animation on Scroll
// ============================================
function initAnimations() {
    // Fade-in animation for elements
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    fadeElements.forEach(el => observer.observe(el));
    
    // Slide-up animation
    const slideUpElements = document.querySelectorAll('.slide-up');
    slideUpElements.forEach(el => observer.observe(el));
}


// ============================================
// Sidebar Active State
// ============================================
function initSidebar() {
    const currentPath = window.location.pathname;
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    
    sidebarLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (currentPath === linkPath) {
            link.classList.add('active');
        }
    });
}


// ============================================
// Analysis Text Counter
// ============================================
function updateCharCount(textarea, counterId, maxLength = 5000) {
    const currentLength = textarea.value.length;
    const counter = document.getElementById(counterId);
    
    if (counter) {
        counter.textContent = `${currentLength} / ${maxLength}`;
        
        if (currentLength > maxLength * 0.9) {
            counter.classList.add('text-warning');
        } else {
            counter.classList.remove('text-warning');
        }
        
        if (currentLength >= maxLength) {
            counter.classList.add('text-danger');
        } else {
            counter.classList.remove('text-danger');
        }
    }
}


// ============================================
// Show Loading Overlay
// ============================================
function showLoadingOverlay(message = 'Processing...') {
    let overlay = document.getElementById('loading-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="text-center">
                <div class="spinner mb-3"></div>
                <p class="mb-0">${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    overlay.style.display = 'flex';
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}


// ============================================
// Copy to Clipboard
// ============================================
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            showToast('Failed to copy text', 'error');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            showToast('Copied to clipboard!', 'success');
        } catch (err) {
            console.error('Failed to copy: ', err);
            showToast('Failed to copy text', 'error');
        }
        
        document.body.removeChild(textArea);
    }
}


// ============================================
// Toast Notifications
// ============================================
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-container');
    existingToasts.forEach(container => container.remove());
    
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove container after toast is hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toastContainer.remove();
    });
}


// ============================================
// Format Date/Time
// ============================================
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return formatDate(dateString);
}


// ============================================
// Score Color Helper
// ============================================
function getScoreClass(score) {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
}

function getScoreLabel(score) {
    if (score >= 70) return 'High Credibility';
    if (score >= 40) return 'Medium Credibility';
    return 'Low Credibility';
}


// ============================================
// Confirm Delete Action
// ============================================
function confirmDelete(message = 'Are you sure you want to delete this item?') {
    return confirm(message);
}


// ============================================
// Export Analysis Results
// ============================================
function exportResults(results, format = 'json') {
    let content = '';
    let filename = `credibility_analysis_${Date.now()}`;
    let mimeType = 'text/plain';
    
    if (format === 'json') {
        content = JSON.stringify(results, null, 2);
        filename += '.json';
        mimeType = 'application/json';
    } else if (format === 'text') {
        content = `Credibility Analysis Results\n`;
        content += `============================\n\n`;
        content += `Overall Score: ${results.score}%\n`;
        content += `Credibility: ${results.label}\n\n`;
        content += `Details:\n`;
        content += `- Sentiment: ${results.sentiment}\n`;
        content += `- Subjectivity: ${results.subjectivity}\n`;
        content += `- Word Count: ${results.word_count}\n`;
        content += `- Analysis Date: ${formatDate(results.date)}\n`;
        filename += '.txt';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    showToast('Results exported successfully!', 'success');
}


// ============================================
// Initialize Character Counters
// ============================================
function initCharCounters() {
    const textareas = document.querySelectorAll('[data-char-counter]');
    
    textareas.forEach(textarea => {
        const maxLength = textarea.getAttribute('maxlength') || 5000;
        const counterId = textarea.getAttribute('data-char-counter');
        
        // Create counter element if it doesn't exist
        let counter = document.getElementById(counterId);
        if (!counter) {
            counter = document.createElement('div');
            counter.id = counterId;
            counter.className = 'form-text text-end';
            counter.textContent = `0 / ${maxLength}`;
            textarea.parentNode.appendChild(counter);
        }
        
        textarea.addEventListener('input', () => updateCharCount(textarea, counterId, parseInt(maxLength)));
    });
}


// ============================================
// Debounce Function
// ============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


// ============================================
// Search Filter
// ============================================
function filterTable(inputId, tableId) {
    const input = document.getElementById(inputId);
    const table = document.getElementById(tableId);
    
    if (!input || !table) return;
    
    input.addEventListener('input', debounce(function() {
        const filter = this.value.toLowerCase();
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(filter) ? '' : 'none';
        });
    }, 300));
}


// ============================================
// Initialize additional features
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initCharCounters();
    
    // Initialize search filters if present
    const searchInputs = document.querySelectorAll('[data-search-table]');
    searchInputs.forEach(input => {
        const tableId = input.getAttribute('data-search-table');
        filterTable(input.id, tableId);
    });
});
