// js/app.js

// Import Auth functions (assuming auth.js is loaded globally via script tag as per original design)
// If using modules, we would import them. For now, we rely on the global scope from auth.js

// API Configuration
const API_CONFIG = {
    baseURL: 'https://ajieasy-backend.onrender.com',
    endpoints: {
        generateQuestions: '/generate-questions/',
        generateQuiz: '/generate-quiz/',
        chat: '/chat/',
        analytics: '/analytics/',
        health: '/health'
    }
};

// State Management
const state = {
    user: null,
    currentView: 'dashboard',
    questions: [],
    quiz: null,
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
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = 'login.html';
    }
}

// Load User Data
function loadUserData() {
    const userStr = localStorage.getItem('user');
    const userEmail = localStorage.getItem('userEmail');

    if (userStr) {
        state.user = JSON.parse(userStr);
    } else if (userEmail) {
        state.user = { name: userEmail.split('@')[0], email: userEmail };
    }

    if (state.user) {
        elements.userInfo.name.textContent = state.user.name;
        elements.userInfo.avatar.textContent = state.user.name.charAt(0).toUpperCase();

        // Update welcome message
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

            // Close sidebar on mobile
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
        localStorage.clear();
        window.location.href = 'login.html';
    });
}

function switchView(viewId) {
    // Update State
    state.currentView = viewId;

    // Update Nav Links
    elements.navLinks.forEach(link => {
        if (link.getAttribute('data-view') === viewId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Update Views
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

// Form Handlers
const topicForm = document.getElementById('topicForm');
if (topicForm) {
    topicForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(topicForm);
        const data = Object.fromEntries(formData.entries());

        toggleLoading(true, 'Generating Interview Questions...');

        try {
            // Simulate API call or use real one
            // For now, using the local fallback generator logic from original app
            await new Promise(r => setTimeout(r, 1500)); // Fake delay

            const questions = generateLocalQuestions(data.topic, data.jobDescription, data.interviewType, data.companyNature);
            displayQuestions(questions);

            // Save to history
            saveToHistory(data.topic, data.jobDescription, data.interviewType, data.companyNature);

        } catch (error) {
            console.error(error);
            showToast('Failed to generate questions', 'error');
        } finally {
            toggleLoading(false);
        }
    });
}

function displayQuestions(questions) {
    const container = document.getElementById('questionsResults');
    container.innerHTML = questions.map((q, i) => `
        <div class="result-card">
            <h4>${i + 1}. ${q.question}</h4>
            <p class="text-muted small mt-2">${q.explanation}</p>
        </div>
    `).join('');
    container.style.display = 'block';
}

// Helper: Toast Notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

// Helper: Local Question Generator (Fallback)
function generateLocalQuestions(topic, jobDesc, type, company) {
    return [
        { question: `Can you explain your experience with ${topic}?`, explanation: "Standard opening question." },
        { question: `How would you handle a difficult situation involving ${topic}?`, explanation: "Behavioral question." },
        { question: `What are the key challenges in ${topic} for a ${company}?`, explanation: "Industry specific question." },
        { question: `Describe a project where you used ${topic}.`, explanation: "Portfolio question." },
        { question: `How do you stay updated with ${topic} trends?`, explanation: "Continuous learning question." }
    ];
}

// Helper: Save History
function saveToHistory(topic, jobDesc, type, company) {
    const history = JSON.parse(localStorage.getItem('questionHistory') || '[]');
    history.unshift({ topic, jobDesc, interviewType: type, companyNature: company, date: new Date().toISOString() });
    localStorage.setItem('questionHistory', JSON.stringify(history.slice(0, 10)));
    loadDashboardHistory();
}
