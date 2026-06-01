/**
 * Credibility Analysis System - Premium Futuristic Javascript
 * Features: Background Particles, Cursor Glow, Dark/Light Mode, Interactive Charts,
 * SVG Score Gauge animations, Auto-expand Textarea, Drag & Drop files, Custom Toasts.
 */

document.addEventListener('DOMContentLoaded', function () {
    // Core Layout Components
    initTheme();
    initCursorGlow();
    initCanvasParticles();
    
    // Interactive Form Controls
    initFormInteractions();
    initDragAndDrop();
    initVoiceInput();
    initCharCounters();

    // Results & Visual Indicators
    initCircularGauge();
    initMetricCounters();
    initChartDashboards();
    initProgressBarWidths();

    // Cyberpunk Dashboard Integrations
    initBotThreatMonitor();
    initDatasetParser();

    // System Utilities
    initToastsAndAlerts();
    initTableSearch();
});

// ============================================
// Theme Management (Dark / Light Mode)
// ============================================
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Check saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        showToast(`Theme changed to ${newTheme} mode!`, 'success');
        
        // Re-render charts for appropriate contrast
        setTimeout(() => {
            if (window.myPieChart) {
                window.myPieChart.destroy();
                renderPieChart();
            }
            if (window.myLineChart) {
                window.myLineChart.destroy();
                renderLineChart();
            }
        }, 100);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    if (!icon) return;
    if (theme === 'light') {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }
}

// ============================================
// Interactive Cursor Glow Follower
// ============================================
function initCursorGlow() {
    // Only enable glow on non-touch desktop screens
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const glow = document.createElement('div');
    glow.className = 'cursor-glow-follower';
    document.body.appendChild(glow);
    glow.style.display = 'block';

    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // Expand on click
    document.addEventListener('mousedown', () => {
        glow.style.width = '240px';
        glow.style.height = '240px';
    });

    document.addEventListener('mouseup', () => {
        glow.style.width = '200px';
        glow.style.height = '200px';
    });
}

// ============================================
// Canvas Particles Engine (Native HTML5)
// ============================================
function initCanvasParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-js';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    const numberOfParticles = 55;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * 0.4 - 0.2;
            this.opacity = Math.random() * 0.5 + 0.15;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Screen boundary bounce
            if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
            if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
        }

        draw() {
            const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
            ctx.fillStyle = isDark ? `rgba(99, 102, 241, ${this.opacity})` : `rgba(37, 99, 235, ${this.opacity * 0.5})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        particlesArray = [];
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        requestAnimationFrame(animate);
    }

    init();
    animate();
}

// ============================================
// Form Interactions (Auto-expand, Password, Scan Animation)
// ============================================
function initFormInteractions() {
    // Password toggling visibility
    const passwordToggles = document.querySelectorAll('.password-toggle-eye');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function () {
            const input = this.parentNode.querySelector('input');
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });

    // Auto-expanding text area
    const textareas = document.querySelectorAll('.textarea-futuristic');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });

    // Forms real-time submission scanner trigger
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        // Exclude profile update form without redirect
        if (form.getAttribute('action') && form.getAttribute('action').includes('analyze')) {
            form.addEventListener('submit', function (e) {
                const textInput = document.getElementById('text_content');
                if (textInput && textInput.value.trim().length >= 10) {
                    showScanningAnimation();
                }
            });
        }
    });
}

function showScanningAnimation() {
    const processingWrapper = document.getElementById('ai-processing-loader');
    const formSection = document.getElementById('analyze-form-card');
    
    if (processingWrapper) {
        if (formSection) formSection.style.display = 'none';
        processingWrapper.style.display = 'flex';
        
        // Typing status descriptions
        const progressStatusText = document.getElementById('processing-status-text');
        const statuses = [
            'Parsing linguistic structure...',
            'Evaluating semantic objectivity...',
            'Calculating URL authority indexes...',
            'Executing neural credibility classifiers...',
            'Formulating diagnostic recommendations...'
        ];
        
        let index = 0;
        const statusInterval = setInterval(() => {
            if (progressStatusText && index < statuses.length) {
                progressStatusText.textContent = statuses[index++];
            } else {
                clearInterval(statusInterval);
            }
        }, 1200);
    }
}

// ============================================
// Drag & Drop File Upload Loader
// ============================================
function initDragAndDrop() {
    const dropZone = document.getElementById('drag-drop-zone');
    const fileInput = document.getElementById('file-upload-input');
    const textarea = document.getElementById('text_content');

    if (!dropZone || !textarea) return;

    // Trigger click on input
    dropZone.addEventListener('click', () => {
        if (fileInput) fileInput.click();
    });

    if (fileInput) {
        fileInput.addEventListener('change', function () {
            handleUploadedFiles(this.files);
        });
    }

    // Drag events
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleUploadedFiles(files);
    });

    function handleUploadedFiles(files) {
        if (files.length === 0) return;
        const file = files[0];

        if (file.type !== 'text/plain') {
            showToast('Only plaintext (.txt) files are supported!', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            textarea.value = e.target.result;
            // Trigger auto-resize & counter update
            textarea.dispatchEvent(new Event('input'));
            showToast(`Loaded ${file.name} successfully!`, 'success');
        };
        reader.readAsText(file);
    }
}

// ============================================
// Voice Input Engine representation
// ============================================
function initVoiceInput() {
    const micBtn = document.getElementById('voice-input-btn');
    const textarea = document.getElementById('text_content');

    if (!micBtn || !textarea) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        micBtn.style.display = 'none'; // Hide if browser doesn't support speech API
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    let isRecording = false;

    micBtn.addEventListener('click', () => {
        if (!isRecording) {
            recognition.start();
        } else {
            recognition.stop();
        }
    });

    recognition.onstart = function () {
        isRecording = true;
        micBtn.innerHTML = '<i class="fas fa-dot-circle text-danger"></i> Listening...';
        micBtn.classList.add('border-danger');
        showToast('Microphone active. Start speaking...', 'info');
    };

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        textarea.value = (textarea.value + ' ' + transcript).trim();
        textarea.dispatchEvent(new Event('input'));
        showToast('Voice transcript inserted successfully!', 'success');
    };

    recognition.onerror = function () {
        showToast('Speech recognition encountered an error.', 'error');
        resetMicButton();
    };

    recognition.onend = function () {
        resetMicButton();
    };

    function resetMicButton() {
        isRecording = false;
        micBtn.innerHTML = '<i class="fas fa-microphone"></i> Voice Input';
        micBtn.classList.remove('border-danger');
    }
}

// ============================================
// Live Text Character Counter
// ============================================
function initCharCounters() {
    const textarea = document.getElementById('text_content');
    const counterText = document.getElementById('live-char-counter');
    if (!textarea || !counterText) return;

    textarea.addEventListener('input', function () {
        const len = this.value.length;
        counterText.textContent = `${len} characters`;
        if (len >= 10) {
            counterText.className = 'text-success';
        } else if (len > 0) {
            counterText.className = 'text-warning';
        } else {
            counterText.className = 'text-muted';
        }
    });
}

// ============================================
// Results Score Gauge Animation (Radial Circle)
// ============================================
function initCircularGauge() {
    const gauge = document.querySelector('.radial-score-bar');
    if (!gauge) return;

    // Get score from data attribute
    const score = parseFloat(gauge.getAttribute('data-score')) || 0;
    
    // Circle circumference = 2 * PI * r = 2 * 3.14159 * 80 = 502.65
    const circumference = 502;
    const offset = circumference - (score * circumference);
    
    setTimeout(() => {
        gauge.style.strokeDashoffset = offset;
    }, 400);
}

// ============================================
// Smooth Metric Counter Animations
// ============================================
function initMetricCounters() {
    const counters = document.querySelectorAll('.animate-counter');
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target')) || 0;
        const decimals = counter.getAttribute('data-decimals') === 'true';
        let current = 0;
        const duration = 1200; // ms
        const stepTime = 16; // ~60fps
        const increment = target / (duration / stepTime);

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = decimals ? current.toFixed(1) : Math.floor(current);
        }, stepTime);
    });
}

// ============================================
// Dynamic Progress/Glow Bars Initialization
// ============================================
function initProgressBarWidths() {
    const glowBars = document.querySelectorAll('.glow-bar-fill');
    glowBars.forEach(bar => {
        const width = bar.getAttribute('data-width');
        if (width !== null) {
            setTimeout(() => {
                bar.style.width = width.trim().endsWith('%') ? width : `${width}%`;
            }, 300);
        }
    });
}

// ============================================
// Interactive Statistics Dashboards (Chart.js)
// ============================================
function initChartDashboards() {
    // Render History charts if elements are present on My Analyses
    if (document.getElementById('pieChartCanvas')) {
        renderPieChart();
    }
    if (document.getElementById('lineChartCanvas')) {
        renderLineChart();
    }
    if (document.getElementById('trustProgressionChart')) {
        renderTrustProgressionChart();
    }
    if (document.getElementById('modelLossChart')) {
        renderModelLossChart();
    }
    if (document.getElementById('categoryDistributionChart')) {
        renderCategoryDistributionChart();
    }
}

function renderPieChart() {
    const canvas = document.getElementById('pieChartCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const credible = parseInt(canvas.getAttribute('data-credible')) || 0;
    const questionable = parseInt(canvas.getAttribute('data-questionable')) || 0;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    if (credible === 0 && questionable === 0) {
        // No data placeholder in chart
        ctx.fillStyle = isLight ? '#94a3b8' : '#475569';
        ctx.font = '14px Inter';
        ctx.fillText('No historical logs available yet', 10, 80);
        return;
    }

    window.myPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Credible', 'Questionable'],
            datasets: [{
                data: [credible, questionable],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 1,
                borderColor: isLight ? '#ffffff' : '#1e293b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: isLight ? '#0f172a' : '#f8fafc',
                        font: { family: 'Inter', size: 12 }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

function renderLineChart() {
    const canvas = document.getElementById('lineChartCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rawData = canvas.getAttribute('data-scores');
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    
    if (!rawData) return;
    
    // Parse list of floats
    const scores = JSON.parse(rawData).reverse(); // Reverse to chronological order
    const labels = scores.map((_, i) => `Analysis #${i + 1}`);

    window.myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Credibility Score (%)',
                data: scores,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                borderWidth: 2,
                fill: true,
                tension: 0.35,
                pointBackgroundColor: '#06b6d4',
                pointBorderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    grid: { color: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' },
                    ticks: { color: isLight ? '#475569' : '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: isLight ? '#475569' : '#94a3b8' }
                }
            }
        }
    });
}

// ============================================
// Interactive Search & Table Filters
// ============================================
function initTableSearch() {
    const searchInput = document.getElementById('cyber-search-input');
    const categoryFilter = document.getElementById('category-filter');
    const tableRows = document.querySelectorAll('.table-cyber tbody tr');

    if (!tableRows.length) return;

    function runFilters() {
        const query = searchInput ? searchInput.value.toLowerCase() : '';
        const cat = categoryFilter ? categoryFilter.value.toLowerCase() : '';

        tableRows.forEach(row => {
            const previewText = row.querySelector('.text-preview-col') ? row.querySelector('.text-preview-col').textContent.toLowerCase() : '';
            const categoryText = row.querySelector('.category-col') ? row.querySelector('.category-col').textContent.toLowerCase() : '';
            
            const matchSearch = previewText.includes(query);
            const matchCategory = cat === '' || categoryText.includes(cat);

            if (matchSearch && matchCategory) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    if (searchInput) searchInput.addEventListener('input', runFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', runFilters);
}

// ============================================
// System Notifications (Toasts & Alerts)
// ============================================
function initToastsAndAlerts() {
    // Automatically close django messages after 4.5 seconds
    const djangoAlerts = document.querySelectorAll('.alert');
    djangoAlerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-10px)';
            alert.style.transition = 'all 0.4s ease';
            setTimeout(() => alert.remove(), 400);
        }, 4500);
    });
}

function showToast(message, type = 'success') {
    // Remove past toast containers to avoid overlap
    const oldContainer = document.querySelector('.toast-container-cyber');
    if (oldContainer) oldContainer.remove();

    const container = document.createElement('div');
    container.className = 'toast-container-cyber position-fixed bottom-0 end-0 p-4';
    container.style.zIndex = '9999';

    const iconHtml = type === 'success' 
        ? '<i class="fas fa-check-circle text-success me-2"></i>'
        : type === 'error'
            ? '<i class="fas fa-exclamation-triangle text-danger me-2"></i>'
            : '<i class="fas fa-info-circle text-cyan me-2"></i>';

    const borderClass = type === 'success' 
        ? 'toast-cyber-success' 
        : type === 'error' 
            ? 'toast-cyber-error' 
            : '';

    container.innerHTML = `
        <div class="toast show toast-cyber ${borderClass}" role="alert">
            <div class="toast-body d-flex align-items-center justify-content-between">
                <div>
                    ${iconHtml}
                    <strong>${message}</strong>
                </div>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" onclick="this.closest('.toast-container-cyber').remove()"></button>
            </div>
        </div>
    `;

    document.body.appendChild(container);

    // Auto remove toast after 3.8s
    setTimeout(() => {
        container.style.opacity = '0';
        container.style.transition = 'opacity 0.5s ease';
        setTimeout(() => container.remove(), 500);
    }, 3800);
}

// ============================================
// Data Archive Export Utility
// ============================================
window.exportResults = function (data, format) {
    if (format === 'json') {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `credibility_archive_${data.timestamp}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('Archive logs exported successfully!', 'success');
    }
};

// ============================================
// Real-time Cyberpunk Bot Threat Monitor Feed
// ============================================
function initBotThreatMonitor() {
    const container = document.getElementById('threat-feed-container');
    if (!container) return;

    const mockLogs = [
        { type: 'danger', msg: '[BOT THREAT] High-frequency payload velocity detected at Node-802.' },
        { type: 'warning', msg: '[BIAS ANOMALY] Heavy syntactic sentiment drift matched profile #41.' },
        { type: 'success', msg: '[SYSTEM INTEGRITY] Verified references lookup matched authority database.' },
        { type: 'warning', msg: '[SECURITY BLOCK] Repetitive structural velocity exceeds limits: IP 172.16.8.20.' },
        { type: 'danger', msg: '[MALWARE SUSPECT] Lexical payload anomaly detected on user review scan.' },
        { type: 'success', msg: '[SCAN OK] Objectivity profile validated at 94.6% confidence.' }
    ];

    function appendLog() {
        const log = mockLogs[Math.floor(Math.random() * mockLogs.length)];
        const badgeColor = log.type === 'danger' ? 'bg-danger text-danger' : log.type === 'warning' ? 'bg-warning text-warning' : 'bg-success text-success';
        const logItem = document.createElement('div');
        logItem.className = 'd-flex align-items-start gap-2 p-2 bg-dark bg-opacity-25 rounded border border-secondary border-opacity-10 fs-9';
        logItem.style.opacity = '0';
        logItem.style.transform = 'translateX(20px)';
        logItem.style.transition = 'all 0.4s ease';

        logItem.innerHTML = `
            <span class="badge ${badgeColor} bg-opacity-15 px-2 py-1 rounded font-monospace uppercase" style="font-size: 0.65rem;">
                ${log.type}
            </span>
            <span class="text-white font-monospace" style="line-height: 1.3;">${log.msg}</span>
        `;

        container.prepend(logItem);

        // Animate in
        setTimeout(() => {
            logItem.style.opacity = '1';
            logItem.style.transform = 'translateX(0)';
        }, 50);

        // Keep last 5 elements only
        const items = container.querySelectorAll('& > div');
        if (items.length > 5) {
            const lastItem = items[items.length - 1];
            lastItem.style.opacity = '0';
            lastItem.style.transform = 'translateY(10px)';
            setTimeout(() => lastItem.remove(), 400);
        }
    }

    // Populate initial logs
    for (let i = 0; i < 4; i++) {
        setTimeout(appendLog, i * 300);
    }

    // Periodically append new logs
    setInterval(appendLog, 4200);
}

// ============================================
// Batch Dataset Drag & Drop Parser Simulation
// ============================================
function initDatasetParser() {
    const dragZone = document.getElementById('dataset-drag-zone');
    const fileInput = document.getElementById('dataset-file-input');
    const progressSection = document.getElementById('dataset-parsing-progress');
    const progressBar = document.getElementById('parsing-progress-bar');
    const progressPercent = document.getElementById('parsing-progress-percent');
    const logBox = document.getElementById('dataset-parsing-logs');

    if (!dragZone || !logBox) return;

    dragZone.addEventListener('click', () => {
        if (fileInput) fileInput.click();
    });

    if (fileInput) {
        fileInput.addEventListener('change', function () {
            simulateParsing(this.files[0]);
        });
    }

    // Drag highlights
    ['dragenter', 'dragover'].forEach(eventName => {
        dragZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dragZone.style.borderColor = 'var(--accent-secondary)';
            dragZone.style.background = 'rgba(139, 92, 246, 0.05)';
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dragZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dragZone.style.borderColor = 'rgba(6, 182, 212, 0.2)';
            dragZone.style.background = 'transparent';
        }, false);
    });

    dragZone.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) simulateParsing(files[0]);
    });

    function simulateParsing(file) {
        if (!file) return;
        const validExtensions = ['.csv', '.json'];
        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!validExtensions.includes(fileExt)) {
            showToast('Unsupported file type! Upload CSV or JSON only.', 'error');
            return;
        }

        // Reset and show progress UI
        progressSection.classList.remove('d-none');
        progressBar.style.width = '0%';
        progressPercent.textContent = '0%';
        logBox.innerHTML = `[SYSTEM] Processing file: ${file.name}<br>[SYSTEM] Upload size: ${(file.size / 1024).toFixed(2)} KB`;

        const logMessages = [
            { time: 500, msg: '[INFO] Initializing asynchronous dataset parser stream...' },
            { time: 1000, msg: '[INFO] Loading structural schema and integrity keys...' },
            { time: 1600, msg: '[INFO] Neural pipeline scan started for 1,240 records...' },
            { time: 2200, msg: '[WARN] Identified bot profile signature matching in 12 records.' },
            { time: 2800, msg: '[INFO] Objectivity clustering complete. Generating weights...' },
            { time: 3300, msg: '[SUCCESS] Bulk diagnostic review completed successfully!' }
        ];

        // Animate progress bar
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 2;
            progressBar.style.width = `${progress}%`;
            progressPercent.textContent = `${progress}%`;

            if (progress >= 100) {
                clearInterval(progressInterval);
                showToast('Batch dataset scan completed successfully!', 'success');
            }
        }, 70);

        // Inject log messages
        logMessages.forEach(log => {
            setTimeout(() => {
                logBox.innerHTML += `<br>${log.msg}`;
                logBox.scrollTop = logBox.scrollHeight;
            }, log.time);
        });
    }
}

// ============================================
// Interactive Trust Anomaly Progression (Chart.js)
// ============================================
function renderTrustProgressionChart() {
    const canvas = document.getElementById('trustProgressionChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 160);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Scan 01', 'Scan 02', 'Scan 03', 'Scan 04', 'Scan 05', 'Scan 06'],
            datasets: [{
                label: 'Global Credibility Ratio',
                data: [72, 85, 61, 93, 80, 96],
                borderColor: '#06b6d4',
                borderWidth: 3,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#06b6d4',
                pointBorderColor: '#ffffff',
                pointHoverRadius: 6,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { size: 9, family: 'monospace' } }
                },
                y: {
                    min: 0,
                    max: 100,
                    grid: { color: 'rgba(255, 255, 255, 0.04)' },
                    ticks: { color: '#64748b', font: { size: 9, family: 'monospace' }, stepSize: 25 }
                }
            }
        }
    });
}

// ============================================
// Deep ML Diagnostics: Model Loss Curve Chart
// ============================================
function renderModelLossChart() {
    const canvas = document.getElementById('modelLossChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Create gradients for curves
    const trainGradient = ctx.createLinearGradient(0, 0, 0, 200);
    trainGradient.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
    trainGradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

    const valGradient = ctx.createLinearGradient(0, 0, 0, 200);
    valGradient.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
    valGradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Epoch 01', 'Epoch 05', 'Epoch 10', 'Epoch 15', 'Epoch 20', 'Epoch 25'],
            datasets: [
                {
                    label: 'Training Loss',
                    data: [0.65, 0.42, 0.28, 0.15, 0.08, 0.04],
                    borderColor: '#06b6d4',
                    borderWidth: 2,
                    backgroundColor: trainGradient,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#06b6d4',
                    pointBorderColor: '#ffffff',
                    pointRadius: 3
                },
                {
                    label: 'Validation Loss',
                    data: [0.70, 0.48, 0.32, 0.19, 0.11, 0.06],
                    borderColor: '#8b5cf6',
                    borderWidth: 2,
                    backgroundColor: valGradient,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#ffffff',
                    pointRadius: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: '#94a3b8', font: { size: 9, family: 'monospace' } }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { size: 9, family: 'monospace' } }
                },
                y: {
                    min: 0,
                    max: 1,
                    grid: { color: 'rgba(255, 255, 255, 0.04)' },
                    ticks: { color: '#64748b', font: { size: 9, family: 'monospace' }, stepSize: 0.25 }
                }
            }
        }
    });
}

// ============================================
// Deep ML Diagnostics: Category Radar Density Chart
// ============================================
function renderCategoryDistributionChart() {
    const canvas = document.getElementById('categoryDistributionChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Parse labels and counts from the Django json_script element or fallback to defaults
    let labels = [];
    let counts = [];

    const jsonTag = document.getElementById('category-data');
    if (jsonTag) {
        try {
            const dataObj = JSON.parse(jsonTag.textContent);
            labels = Object.keys(dataObj);
            counts = Object.values(dataObj);
        } catch (e) {
            console.error('Error parsing category-data JSON', e);
        }
    }

    if (labels.length === 0) {
        // Fallback default mock data for design presentation
        labels = ['News Article', 'Social Media Post', 'User Review', 'Blog Content', 'Forum Discussion', 'Other / General'];
        counts = [34, 45, 18, 22, 11, 8];
    }

    const radarGradient = ctx.createLinearGradient(0, 0, 0, 200);
    radarGradient.addColorStop(0, 'rgba(139, 92, 246, 0.35)');
    radarGradient.addColorStop(1, 'rgba(6, 182, 212, 0.1)');

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Payload Scans Count',
                data: counts,
                borderColor: '#8b5cf6',
                borderWidth: 2,
                backgroundColor: radarGradient,
                fill: true,
                pointBackgroundColor: '#06b6d4',
                pointBorderColor: '#ffffff',
                pointHoverRadius: 6,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.06)' },
                    grid: { color: 'rgba(255, 255, 255, 0.06)' },
                    pointLabels: { color: '#94a3b8', font: { size: 9, family: 'monospace' } },
                    ticks: { display: false }
                }
            }
        }
    });
}
