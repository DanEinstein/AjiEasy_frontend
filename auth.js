// auth.js - Central Authentication Module for AjiEasy
// This file contains all reusable authentication functions

// Backend API base URL
const API_URL = 'http://127.0.0.1:8000';  // ✅ Matches your backend

/**
 * Login user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Response from the server
 */
async function loginUser(email, password) {
    try {
        // FastAPI /token endpoint expects FormData with 'username' and 'password'
        const formData = new FormData();
        formData.append('username', email); // Note: using 'username' field for email
        formData.append('password', password);

        const response = await fetch(`${API_URL}/token`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            // Save the access token to localStorage
            localStorage.setItem('accessToken', data.access_token);
            
            // Optionally save user info if provided
            if (data.user) {
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('userName', data.user.name);
            }
        }

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw new Error('Network error. Please check your connection.');
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

        return data;
    } catch (error) {
        console.error('Registration error:', error);
        throw new Error('Network error. Please check your connection.');
    }
}

/**
 * Log out the current user
 * Clears all authentication data from localStorage and redirects to login
 */
function logoutUser() {
    // Clear all user data from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

/**
 * Check if user is authenticated
 * If not authenticated, redirect to login page
 * This function should be called on protected pages
 */
function checkAuth() {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
        // No token found - redirect to login
        window.location.href = 'login.html';
    }
}

/**
 * Get the current access token
 * @returns {string|null} The access token or null if not found
 */
function getToken() {
    return localStorage.getItem('accessToken');
}

/**
 * Get the current user's email
 * @returns {string|null} The user's email or null if not found
 */
function getUserEmail() {
    return localStorage.getItem('userEmail');
}

/**
 * Get the current user's name
 * @returns {string|null} The user's name or null if not found
 */
function getUserName() {
    return localStorage.getItem('userName');
}

/**
 * Make an authenticated API request
 * @param {string} endpoint - The API endpoint (e.g., '/generate-questions')
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Object>} Response from the server
 */
async function authenticatedRequest(endpoint, options = {}) {
    const token = getToken();
    
    if (!token) {
        throw new Error('Not authenticated');
    }

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
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, mergedOptions);
        
        // If unauthorized, clear token and redirect to login
        if (response.status === 401) {
            logoutUser();
            return;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}