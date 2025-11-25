const CONFIG = {
    // API_URL: 'https://ajieasy-backend.onrender.com', // Production URL
    API_URL: 'http://127.0.0.1:8000', // Local development URL
    ENDPOINTS: {
        LOGIN: '/token',
        REGISTER: '/register/',
        GENERATE_QUESTIONS: '/generate-questions/',
        GENERATE_QUIZ: '/generate-quiz/',
        CHAT: '/chat/',
        ANALYTICS: '/analytics/',
        RECOMMENDATIONS: '/recommendations/',
        HEALTH: '/health'
    }
};

// Export for use in other files
window.CONFIG = CONFIG;
