const CONFIG = {
    API_URL: 'https://ajieasy-backend.onrender.com', // Default production URL
    // API_URL: 'http://localhost:8000', // Uncomment for local development
    ENDPOINTS: {
        LOGIN: '/token',
        REGISTER: '/register/',
        GENERATE_QUESTIONS: '/generate-questions/',
        GENERATE_QUIZ: '/generate-quiz/',
        CHAT: '/chat/',
        ANALYTICS: '/analytics/',
        HEALTH: '/health'
    }
};

// Export for use in other files
window.CONFIG = CONFIG;
