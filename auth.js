// auth.js - Central Authentication Module for AjiEasy
// This file contains all reusable authentication functions

// Emergency Fallback
if (!window.CONFIG || !window.CONFIG.API_URL) {
    console.error("CONFIG missing! Injecting emergency fallback.");
    window.CONFIG = {
        API_URL: "https://ajieasy-backend.onrender.com",
        TOKEN_KEY: "aji_token",
        USER_KEY: "aji_user"
    };
}

const API_URL = window.CONFIG.API_URL;

// Global Error Banner
function showError(msg) {
    let banner = document.getElementById("global-error");
    if (!banner) {
        banner = document.createElement("div");
        banner.id = "global-error";
        banner.style.cssText = "position:fixed;top:0;left:0;width:100%;background:#dc3545;color:white;text-align:center;padding:12px;z-index:9999;font-weight:bold;";
        document.body.prepend(banner);
    }
    banner.textContent = "Error: " + msg;
    setTimeout(() => {
        if (banner) banner.remove();
    }, 5000);
}

/**
 * Login user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Response from the server
 */
async function loginUser(email, password) {
    try {
        // Use URLSearchParams for x-www-form-urlencoded
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        const response = await fetch(`${API_URL}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        const data = await response.json();

        if (response.ok) {
            // Save tokens using the configured key
            localStorage.setItem(window.CONFIG.TOKEN_KEY, data.access_token);
            // Also save as 'accessToken' for backward compatibility if needed
            localStorage.setItem('accessToken', data.access_token);

            if (data.user) {
                localStorage.setItem(window.CONFIG.USER_KEY, JSON.stringify(data.user));
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('userName', data.user.name);
            }
        } else {
            showError(data.detail || 'Login failed');
        }

        return data;
    } catch (error) {
        console.error('Login error:', error);
        showError('Network error. Please check your connection.');
        throw error;
    }
}

/**
 * Register a new user
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Response from the server
 */
async function registerUser(name, email, password) {
    try {
        const response = await fetch(`${API_URL}/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });

        const data = await response.json();
        if (!response.ok) {
            showError(data.detail || 'Registration failed');
        }
        return data;
    } catch (error) {
        console.error('Registration error:', error);
        showError('Network error during registration.');
        throw error;
    }
}

/**
 * Log out the current user
 */
function logoutUser() {
    localStorage.removeItem(window.CONFIG.TOKEN_KEY);
    localStorage.removeItem('accessToken');
    localStorage.removeItem(window.CONFIG.USER_KEY);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

/**
 * Check if user is authenticated
 */
function checkAuth() {
    const token = localStorage.getItem(window.CONFIG.TOKEN_KEY) || localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = 'login.html';
    }
}

/**
 * Get the current access token
 */
function getToken() {
    return localStorage.getItem(window.CONFIG.TOKEN_KEY) || localStorage.getItem('accessToken');
}

/**
 * Make an authenticated API request
 */
async function authenticatedRequest(endpoint, options = {}) {
    const token = getToken();

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Ensure endpoint starts with / if not present (though we construct with template literal)
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_URL}${cleanEndpoint}`;

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };

    try {
        const response = await fetch(url, mergedOptions);

        if (response.status === 401) {
            logoutUser();
            return;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || `HTTP error! status: ${response.status}`;
            showError(errorMessage);
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        showError(error.message || 'API request failed');
        throw error;
    }
}

// Export functions
window.auth = {
    loginUser,
    registerUser,
    logoutUser,
    checkAuth,
    getToken,
    authenticatedRequest,
    showError
};

