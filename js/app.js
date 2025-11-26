// js/app.js - Complete Integration with Gemini & Groq

// Emergency Fallback
if (!window.CONFIG || !window.CONFIG.API_URL) {
    console.error("CONFIG missing! Injecting emergency fallback.");
    window.CONFIG = {
        API_URL: "https://ajieasy-backend.onrender.com",
        TOKEN_KEY: "aji_token",
        USER_KEY: "aji_user"
    };
}

// UNIVERSAL FETCH WITH TOKEN — USE THIS EVERYWHERE
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem(window.CONFIG.TOKEN_KEY) || localStorage.getItem("accessToken");

    const headers = {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
        ...options.headers
    };

    const response = await fetch(`${window.CONFIG.API_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem(window.CONFIG.TOKEN_KEY);
        localStorage.removeItem("accessToken");
        localStorage.removeItem(window.CONFIG.USER_KEY);
        localStorage.removeItem("user");
        window.location.href = "login.html";
        return;
    }

    return response;
}

// State Management
const state = {
    user: null,
    currentView: 'dashboard',
    questions: [],
    quiz: [],
    chatHistory: []
};

// DOM Elements
const elements = {
    sidebar: document.getElementById('sidebar'),
    hamburger: document.getElementById('hamburgerMenu'),
    mainContent: document.getElementById('mainContent'),
    views: {
        dashboard: document.getElementById('dashboardView'),
        questions: document.getElementById('questionsView'),
        quiz: document.getElementById('quizView'),
        chat: document.getElementById('chatView'),
        analytics: document.getElementById('analyticsView')
    },
    navLinks: document.querySelectorAll('.nav-link'),
    userInfo: {
        name: document.getElementById('userName'),
        avatar: document.getElementById('userAvatar')
    },
    loading: document.getElementById('loadingOverlay')
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    initializeNavigation();
    loadUserData();
    loadDashboardHistory();
    loadRecommendations();
});

// Authentication Check
function checkAuthentication() {
    const token = localStorage.getItem(window.CONFIG.TOKEN_KEY) || localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = 'login.html';
    }
}

// Load User Data
function loadUserData() {
    const userStr = localStorage.getItem(window.CONFIG.USER_KEY) || localStorage.getItem('user');
    const userEmail = localStorage.getItem('userEmail');

    if (userStr) {
        state.user = JSON.parse(userStr);
    } else if (userEmail) {
        state.user = { name: userEmail.split('@')[0], email: userEmail };
    }

    if (state.user) {
        elements.userInfo.name.textContent = state.user.name;
        elements.userInfo.avatar.textContent = state.user.name.charAt(0).toUpperCase();

        const welcomeMsg = document.getElementById('welcomeMessage');
        if (welcomeMsg) welcomeMsg.textContent = `Welcome back, ${state.user.name}!`;
    }
}

// Navigation Logic
function initializeNavigation() {
    // Sidebar Toggle
    elements.hamburger.addEventListener('click', () => {
        elements.sidebar.classList.toggle('active');
        elements.hamburger.classList.toggle('active');
    });

    // Nav Links
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = link.getAttribute('data-view');
            switchView(viewId);

            if (window.innerWidth <= 992) {
                elements.sidebar.classList.remove('active');
                elements.hamburger.classList.remove('active');
            }
        });
    });

    // Dashboard Cards
    document.querySelectorAll('.action-card').forEach(card => {
        card.addEventListener('click', () => {
            const viewId = card.getAttribute('data-view');
            switchView(viewId);
        });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        if (window.auth && window.auth.logoutUser) {
            window.auth.logoutUser();
        } else {
            localStorage.clear();
            window.location.href = 'login.html';
        }
    });
}

function switchView(viewId) {
    state.currentView = viewId;

    elements.navLinks.forEach(link => {
        if (link.getAttribute('data-view') === viewId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    Object.values(elements.views).forEach(view => {
        if (view) view.classList.remove('active');
    });

    if (elements.views[viewId]) {
        elements.views[viewId].classList.add('active');
    }
}

// Loading State
function toggleLoading(show, message = 'Loading...') {
    if (show) {
        document.getElementById('loadingMessage').textContent = message;
        elements.loading.classList.remove('hidden');
        elements.loading.style.display = 'flex';
    } else {
        elements.loading.classList.add('hidden');
        elements.loading.style.display = 'none';
    }
}

// Dashboard History
function loadDashboardHistory() {
    const historyList = document.getElementById('recentActivityList');
    const history = JSON.parse(localStorage.getItem('questionHistory') || '[]');

    if (history.length === 0) {
        historyList.innerHTML = '<div class="activity-item">No recent activity. Start your first interview prep!</div>';
        return;
    }

    historyList.innerHTML = history.slice(0, 3).map(item => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-history"></i>
            </div>
            <div class="activity-details">
                <div class="activity-title">${item.topic}</div>
                <div class="activity-meta">${new Date(item.date).toLocaleDateString()} • ${item.interviewType || 'General'}</div>
            </div>
        </div>
    `).join('');
}

// --- QUESTIONS LOGIC (Gemini) - FIXED ---
const topicForm = document.getElementById('topicForm');
if (topicForm) {
    topicForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(topicForm);
        const data = Object.fromEntries(formData.entries());

        toggleLoading(true, 'Generating Questions with Gemini...');

        // Clear previous results safely
        const questionsResults = document.getElementById('questionsResults');
        if (questionsResults) {
            questionsResults.style.display = 'none';
            questionsResults.innerHTML = '';
        }

        try {
            const response = await apiFetch("/generate-questions/", {
                method: 'POST',
                body: JSON.stringify({
                    topic: data.topic,
                    job_description: data.jobDescription,
                    interview_type: data.interviewType,
                    company_nature: data.companyNature
                })
            });

            if (!response.ok) throw new Error('Failed to generate questions');

            const questions = await response.json();
            console.log("Received questions:", questions);
            displayQuestions(questions);
            saveToHistory(data);

        } catch (error) {
            console.error(error);
            showToast('Failed to generate questions. Please try again.', 'error');
        } finally {
            toggleLoading(false);
        }
    });
}

// FIXED: Questions display with safe rendering
function displayQuestions(questions) {
    console.log("Displaying questions:", questions);

    // Robustness: Handle wrapped response if backend sends { questions: [...] }
    if (!Array.isArray(questions) && questions.questions) {
        questions = questions.questions;
    }

    if (!Array.isArray(questions)) {
        console.error("Invalid questions format:", questions);
        showToast('Received invalid data format from server.', 'error');
        return;
    }

    const container = document.getElementById('questionsResults');
    if (!container) {
        console.error('Questions results container not found');
        return;
    }

    try {
        // Safe HTML generation with error handling
        const questionsHTML = questions.map((q, i) => {
            try {
                // Safe property access with fallbacks
                const type = q.type || 'General';
                const difficulty = q.difficulty || 'Medium';
                const questionText = q.question || 'No question text available';
                const explanation = q.explanation || '';

                return `
                    <div class="result-card fade-in" style="animation-delay: ${i * 0.1}s">
                        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:1rem;">
                            <span class="badge" style="background:rgba(22, 199, 154, 0.1); color:var(--primary-teal); padding:4px 8px; border-radius:4px; font-size:0.8rem;">${escapeHtml(type)}</span>
                            <span class="badge" style="background:rgba(255,255,255,0.1); padding:4px 8px; border-radius:4px; font-size:0.8rem;">${escapeHtml(difficulty)}</span>
                        </div>
                        <h3 style="font-size:1.1rem; margin-bottom:0.5rem; line-height:1.5;">${escapeHtml(questionText)}</h3>
                        <p style="color:var(--text-secondary); font-size:0.9rem;">${escapeHtml(explanation)}</p>
                    </div>
                `;
            } catch (error) {
                console.error('Error rendering question:', error, q);
                return `<div class="result-card">Error displaying question</div>`;
            }
        }).join('');

        container.innerHTML = questionsHTML;
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
        container.style.gap = '1.5rem';

    } catch (error) {
        console.error('Error displaying questions:', error);
        container.innerHTML = '<div class="result-card">Error displaying questions. Please try again.</div>';
        container.style.display = 'block';
    }
}

// Safe HTML escaping function
function escapeHtml(unsafe) {
    if (unsafe === undefined || unsafe === null) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function saveToHistory(data) {
    const history = JSON.parse(localStorage.getItem('questionHistory') || '[]');
    history.unshift({
        topic: data.topic,
        interviewType: data.interviewType,
        date: new Date().toISOString()
    });
    localStorage.setItem('questionHistory', JSON.stringify(history.slice(0, 10)));
    loadDashboardHistory();
}

// --- QUIZ LOGIC (Gemini) - FIXED ---
const quizForm = document.getElementById('quizForm');
let currentQuestionIndex = 0;
let quizScore = 0;

if (quizForm) {
    quizForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(quizForm);
        const data = Object.fromEntries(formData.entries());

        toggleLoading(true, 'Generating Quiz with Gemini...');
        document.getElementById('quizSetup').classList.add('hidden');

        try {
            const response = await apiFetch("/generate-quiz/", {
                method: 'POST',
                body: JSON.stringify({
                    topic: data.topic,
                    difficulty: data.difficulty,
                    question_count: 10
                })
            });

            if (!response.ok) throw new Error('Failed to generate quiz');

            const result = await response.json();
            state.quiz = result.questions || result;
            startQuiz(state.quiz);

        } catch (error) {
            console.error(error);
            showToast('Failed to generate quiz. Please try again.', 'error');
            document.getElementById('quizSetup').classList.remove('hidden');
        } finally {
            toggleLoading(false);
        }
    });
}

// FIXED: Quiz initialization with proper timing
function startQuiz(questions) {
    currentQuestionIndex = 0;
    quizScore = 0;

    const quizInterface = document.getElementById('quizInterface');
    const quizResults = document.getElementById('quizResults');
    const quizSetup = document.getElementById('quizSetup');

    quizSetup.classList.add('hidden');
    quizResults.classList.add('hidden');
    quizInterface.classList.remove('hidden');

    // Force reflow for CSS transitions
    quizInterface.offsetHeight;

    setTimeout(() => {
        showQuestion(0);
    }, 100);
}

// FIXED: Question display with proper timing
function showQuestion(index) {
    if (!state.quiz || !state.quiz[index]) {
        console.error('No question found at index:', index);
        return;
    }

    const question = state.quiz[index];
    const container = document.getElementById('quizQuestionContainer');
    const progressText = document.getElementById('quizProgressText');
    const progressBar = document.getElementById('quizProgressBar');

    progressText.textContent = `Question ${index + 1} of ${state.quiz.length}`;
    progressBar.style.width = `${((index + 1) / state.quiz.length) * 100}%`;

    let options = question.options;
    if (typeof options === 'string') {
        try {
            options = JSON.parse(options);
        } catch (e) {
            console.error('Failed to parse options:', e);
            options = [];
        }
    }

    if (!Array.isArray(options)) {
        console.error('Options is not an array:', options);
        options = [];
    }

    console.log('Rendering question:', question.question);
    console.log('Options:', options);

    container.innerHTML = '';

    setTimeout(() => {
        container.innerHTML = `
            <div class="question-card fade-in">
                <h3>${escapeHtml(question.question)}</h3>
                <div class="options-grid">
                    ${options.map((opt, i) => `
                        <button class="option-btn" data-option-index="${i}">${escapeHtml(opt)}</button>
                    `).join('')}
                </div>
                <div id="feedbackArea" class="mt-3 hidden"></div>
            </div>
        `;

        // Add event listeners to option buttons
        const optionButtons = container.querySelectorAll('.option-btn');
        optionButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const selectedIndex = parseInt(this.getAttribute('data-option-index'));
                checkAnswer(selectedIndex);
            });
        });
    }, 50);

    const nextBtn = document.getElementById('nextQuestionBtn');
    const finishBtn = document.getElementById('finishQuizBtn');
    if (nextBtn) nextBtn.classList.add('hidden');
    if (finishBtn) finishBtn.classList.add('hidden');
}

// FIXED: Robust checkAnswer function
function checkAnswer(selectedIndex) {
    try {
        const question = state.quiz[currentQuestionIndex];
        if (!question) {
            console.error('No question found at current index:', currentQuestionIndex);
            return;
        }

        const feedback = document.getElementById('feedbackArea');
        const buttons = document.querySelectorAll('.option-btn');

        buttons.forEach(btn => btn.disabled = true);

        let options = question.options;
        if (typeof options === 'string') {
            try {
                options = JSON.parse(options);
            } catch (e) {
                console.error('Failed to parse options:', e);
                options = [];
            }
        }

        if (!Array.isArray(options)) {
            options = [];
        }

        // Clean options
        options = options.map(opt => opt || '');

        let correctAnswerIndex = question.correctAnswer;

        // Parse correct answer
        if (typeof correctAnswerIndex === 'string') {
            const parsedNumber = parseInt(correctAnswerIndex.trim());
            if (!isNaN(parsedNumber) && parsedNumber >= 0 && parsedNumber < options.length) {
                correctAnswerIndex = parsedNumber;
            } else {
                // Safe string comparison
                correctAnswerIndex = options.findIndex(opt => {
                    if (!opt || !correctAnswerIndex) return false;
                    const optStr = String(opt).toLowerCase().trim();
                    const correctStr = String(correctAnswerIndex).toLowerCase().trim();
                    return optStr === correctStr;
                });
            }
        }

        // Validate correct answer
        if (correctAnswerIndex === undefined || correctAnswerIndex === null ||
            correctAnswerIndex === -1 || correctAnswerIndex >= options.length) {
            console.error('Invalid correct answer index:', correctAnswerIndex);
            feedback.innerHTML = `<div class="alert alert-warning">⚠️ Unable to verify answer. ${question.explanation || 'Please continue.'}</div>`;
            feedback.classList.remove('hidden');
            return;
        }

        // Score the answer
        if (selectedIndex === correctAnswerIndex) {
            quizScore++;
            feedback.innerHTML = `<div class="alert alert-success">✅ Correct! ${escapeHtml(question.explanation || '')}</div>`;
            buttons[selectedIndex].classList.add('correct');
        } else {
            const correctAnswerText = options[correctAnswerIndex] || 'Unknown';
            feedback.innerHTML = `<div class="alert alert-danger">❌ Incorrect. The correct answer was: ${escapeHtml(correctAnswerText)}. ${escapeHtml(question.explanation || '')}</div>`;
            buttons[selectedIndex].classList.add('wrong');
            if (buttons[correctAnswerIndex]) {
                buttons[correctAnswerIndex].classList.add('correct');
            }
        }

        feedback.classList.remove('hidden');

        // Show navigation
        if (currentQuestionIndex < state.quiz.length - 1) {
            const nextBtn = document.getElementById('nextQuestionBtn');
            if (nextBtn) {
                nextBtn.classList.remove('hidden');
                nextBtn.onclick = () => {
                    currentQuestionIndex++;
                    showQuestion(currentQuestionIndex);
                };
            }
        } else {
            const finishBtn = document.getElementById('finishQuizBtn');
            if (finishBtn) {
                finishBtn.classList.remove('hidden');
                finishBtn.onclick = finishQuiz;
            }
        }

    } catch (error) {
        console.error('Error in checkAnswer:', error);
        const feedback = document.getElementById('feedbackArea');
        if (feedback) {
            feedback.innerHTML = `<div class="alert alert-warning">⚠️ An error occurred. Please continue to the next question.</div>`;
            feedback.classList.remove('hidden');
        }
    }
}

function finishQuiz() {
    document.getElementById('quizInterface').classList.add('hidden');
    document.getElementById('quizResults').classList.remove('hidden');

    const percentage = Math.round((quizScore / state.quiz.length) * 100);
    document.getElementById('finalScore').textContent = percentage;

    let message = "Keep practicing!";
    if (percentage >= 80) message = "Outstanding performance! 🏆";
    else if (percentage >= 60) message = "Good job! You're getting there. 👍";

    document.getElementById('scoreMessage').textContent = message;
}

// --- CHAT LOGIC (Groq) ---
const chatForm = document.getElementById('chatForm');
if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message) return;

        appendMessage('user', message);
        input.value = '';

        const loadingId = appendMessage('ai', 'Thinking...', true);

        try {
            const response = await apiFetch("/chat/", {
                method: 'POST',
                body: JSON.stringify({
                    topic: "General Interview Prep",
                    message: message,
                    history: state.chatHistory
                })
            });

            const data = await response.json();

            document.getElementById(loadingId).remove();
            appendMessage('ai', data.response || data.message);

            state.chatHistory.push({ role: 'user', content: message });
            state.chatHistory.push({ role: 'assistant', content: data.response });

        } catch (error) {
            document.getElementById(loadingId).remove();
            appendMessage('ai', 'Sorry, I encountered an error. Please try again.');
        }
    });
}

function appendMessage(role, text, isLoading = false) {
    const container = document.getElementById('chatMessages');
    const id = 'msg-' + Date.now();

    const div = document.createElement('div');
    div.className = `message ${role === 'user' ? 'user-message' : 'ai-message'}`;
    div.id = id;

    div.innerHTML = `
        <div class="message-avatar"><i class="fas ${role === 'user' ? 'fa-user' : 'fa-robot'}"></i></div>
        <div class="message-content">${escapeHtml(text)}</div>
    `;

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
}

// --- ANALYTICS LOGIC (Gemini) ---
const refreshAnalyticsBtn = document.getElementById('refreshAnalytics');
if (refreshAnalyticsBtn) {
    refreshAnalyticsBtn.addEventListener('click', loadAnalytics);
}

document.querySelectorAll('.nav-link[data-view="analytics"]').forEach(btn => {
    btn.addEventListener('click', loadAnalytics);
});

async function loadAnalytics() {
    try {
        const response = await apiFetch("/analytics/", {
            method: 'GET'
        });

        const data = await response.json();

        document.getElementById('statQuestions').textContent = data.total_questions_attempted || 0;
        document.getElementById('statQuizScore').textContent = (data.average_score || 0) + '%';
        document.getElementById('statStreak').textContent = data.streak_days || 0;

        const chartContainer = document.getElementById('topicMasteryChart');
        if (data.topic_mastery) {
            chartContainer.innerHTML = Object.entries(data.topic_mastery).map(([topic, score]) => `
                <div style="margin-bottom: 10px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:4px;">
                        <span>${escapeHtml(topic)}</span>
                        <span>${score}%</span>
                    </div>
                    <div style="background:#eee; height:8px; border-radius:4px; overflow:hidden;">
                        <div style="background:var(--primary-teal); height:100%; width:${score}%"></div>
                    </div>
                </div>
            `).join('');
        }

    } catch (error) {
        console.error("Analytics load error", error);
    }
}

// --- RECOMMENDATIONS LOGIC (Gemini) ---
async function loadRecommendations() {
    const container = document.getElementById('recommendationsList');
    if (!container) return;

    try {
        const response = await apiFetch("/recommendations/", {
            method: 'GET'
        });

        if (response.ok) {
            const data = await response.json();
            const recommendations = data.recommendations || data;

            container.innerHTML = recommendations.map(rec => `
                <div class="rec-card" style="border-left: 4px solid ${rec.color || '#16c79a'}">
                    <div style="font-size: 1.5rem; margin-bottom: 0.5rem; color: ${rec.color || '#16c79a'}">
                        <i class="fas ${rec.icon || 'fa-star'}"></i>
                    </div>
                    <h4 style="font-size: 1rem; margin-bottom: 0.2rem;">${escapeHtml(rec.topic)}</h4>
                    <p style="font-size: 0.8rem; opacity: 0.8;">${escapeHtml(rec.trend)}</p>
                </div>
            `).join('');
        } else {
            loadStaticRecommendations(container);
        }
    } catch (error) {
        console.error('Recommendations error:', error);
        loadStaticRecommendations(container);
    }
}

function loadStaticRecommendations(container) {
    const trends = [
        { topic: 'AI Engineering', icon: 'fa-robot', color: '#16c79a', trend: 'High Demand' },
        { topic: 'System Design', icon: 'fa-sitemap', color: '#667eea', trend: 'Evergreen' },
        { topic: 'Cloud Architecture', icon: 'fa-cloud', color: '#0f3460', trend: 'Growing' },
        { topic: 'Cybersecurity', icon: 'fa-shield-alt', color: '#e53e3e', trend: 'Critical' }
    ];

    container.innerHTML = trends.map(trend => `
        <div class="rec-card" style="border-left: 4px solid ${trend.color}">
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem; color: ${trend.color}">
                <i class="fas ${trend.icon}"></i>
            </div>
            <h4 style="font-size: 1rem; margin-bottom: 0.2rem;">${trend.topic}</h4>
            <p style="font-size: 0.8rem; opacity: 0.8;">${trend.trend}</p>
        </div>
    `).join('');
}

// Helper: Toast Notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}