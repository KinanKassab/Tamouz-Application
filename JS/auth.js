/* 
===========================================
SCOUTPLUSE - AUTHENTICATION SERVICE
===========================================

This file handles all authentication-related functionality including:
1. User login and logout
2. Session management
3. User data loading
4. Login form handling
5. Demo account functionality

The authentication system uses localStorage for session persistence
and supports multiple user roles with different permissions.
*/

/**
 * Authentication Service Class
 * 
 * Handles all authentication operations including login, logout,
 * and session management. Uses localStorage for persistence.
 */
class AuthService {
    // Storage key for user session data
    static STORAGE_KEY = 'scoutpluse_user';
    
    // Cache for user data
    static users = null;

    /**
     * Load Users from JSON File
     * 
     * Attempts to load user data from users.json file.
     * Falls back to demo data if file is not available.
     * 
     * @returns {Promise<Object>} User data object
     */
    static async loadUsers() {
        // Return cached data if already loaded
        if (this.users) {
            console.log('📋 Using cached user data');
            return this.users;
        }
        
        console.log('📥 Loading user data...');
        
        try {
            // Attempt to load from JSON file
            const response = await fetch('/JS/users.json');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.users = {};
            
            // Convert array to object with email as key
            data.users.forEach(user => {
                this.users[user.email] = user;
                console.log(`👤 Loaded user: ${user.email} (${user.role})`);
            });
            
            console.log(`✅ Successfully loaded ${data.users.length} users from JSON`);
            return this.users;
            
        } catch (error) {
            console.warn('⚠️ Failed to load users.json:', error.message);
            console.log('🔄 Falling back to demo data');
            
            // Fallback to demo data
            this.users = DEMO_USERS;
            return this.users;
        }
    }

    /**
     * User Login
     * 
     * Authenticates a user with email and password.
     * Simulates API call with delay for realistic UX.
     * 
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Promise<Object|null>} User object if successful, null if failed
     */
    static async login(email, password) {
        console.log(`🔐 Attempting login for: ${email}`);
        
        // Simulate API call delay for realistic UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Load user data
        const users = await this.loadUsers();
        const user = users[email];
        
        // Validate credentials
        if (user && user.password === password) {
            console.log(`✅ Login successful for: ${email}`);
            
            // Store user session
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
            
            // Log user details (excluding password)
            const { password: _, ...userInfo } = user;
            console.log('👤 User details:', userInfo);
            
            return user;
        }
        
        console.log(`❌ Login failed for: ${email}`);
        return null;
    }

    /**
     * User Logout
     * 
     * Clears the user session and removes stored data.
     */
    static logout() {
        console.log('🚪 Logging out user');
        
        // Remove user session from storage
        localStorage.removeItem(this.STORAGE_KEY);
        
        console.log('✅ User logged out successfully');
    }

    /**
     * Get Current User
     * 
     * Retrieves the currently authenticated user from storage.
     * 
     * @returns {Object|null} Current user object or null if not authenticated
     */
    static getCurrentUser() {
        try {
            const storedUser = localStorage.getItem(this.STORAGE_KEY);
            
            if (storedUser) {
                const user = JSON.parse(storedUser);
                console.log(`👤 Current user: ${user.name} (${user.email})`);
                return user;
            }
            
            console.log('🔒 No authenticated user found');
            return null;
            
        } catch (error) {
            console.error('❌ Error retrieving current user:', error);
            return null;
        }
    }

    /**
     * Check Authentication Status
     * 
     * Determines if a user is currently authenticated.
     * 
     * @returns {boolean} True if user is authenticated, false otherwise
     */
    static isAuthenticated() {
        const user = this.getCurrentUser();
        const isAuth = user !== null;
        
        console.log(`🔐 Authentication status: ${isAuth ? 'Authenticated' : 'Not authenticated'}`);
        return isAuth;
    }

    /**
     * Update User Data
     * 
     * Updates the current user's data in storage.
     * 
     * @param {Object} userData - Updated user data
     */
    static updateUser(userData) {
        console.log('📝 Updating user data');
        
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
            console.log('✅ User data updated successfully');
        } catch (error) {
            console.error('❌ Error updating user data:', error);
        }
    }
}

/**
 * Login Form Handler Class
 * 
 * Manages the login form UI, validation, and user interactions.
 * Handles form submission, demo accounts, and visual feedback.
 */
class LoginHandler {
    constructor() {
        console.log('🎨 Initializing login form handler');
        
        // Get form elements
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.loginBtn = document.getElementById('loginBtn');
        this.errorDiv = document.getElementById('loginError');
        this.demoAccounts = document.querySelectorAll('.demo-account');
        
        // Initialize if form exists
        if (this.form) {
            this.init();
            console.log('✅ Login form handler initialized');
        } else {
            console.log('ℹ️ Login form not found, skipping initialization');
        }
    }

    /**
     * Initialize Login Handler
     * 
     * Sets up event listeners and form functionality.
     */
    init() {
        // Form submission
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Password visibility toggle
        if (this.passwordToggle) {
            this.passwordToggle.addEventListener('click', this.togglePassword.bind(this));
        }
        
        // Demo account buttons
        this.demoAccounts.forEach(account => {
            account.addEventListener('click', this.fillDemoAccount.bind(this));
        });
        
        // Input validation on change
        if (this.emailInput) {
            this.emailInput.addEventListener('input', this.validateEmail.bind(this));
        }
        
        if (this.passwordInput) {
            this.passwordInput.addEventListener('input', this.validatePassword.bind(this));
        }
        
        console.log('🎧 Login form event listeners attached');
    }

    /**
     * Handle Form Submission
     * 
     * Processes login form submission with validation and authentication.
     * 
     * @param {Event} e - Form submission event
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        console.log('📝 Login form submitted');
        
        // Get form values
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        
        // Basic validation
        if (!this.validateForm(email, password)) {
            return;
        }
        
        // Show loading state
        this.setLoading(true);
        this.hideError();
        
        try {
            console.log(`🔐 Attempting authentication for: ${email}`);
            
            // Attempt login
            const user = await AuthService.login(email, password);
            
            if (user) {
                console.log('✅ Authentication successful');
                this.showSuccess();
                
                // Redirect after short delay
                setTimeout(() => {
                    console.log('🔄 Redirecting to main application');
                    window.location.reload(); // Reload to show main app
                }, 500);
                
            } else {
                console.log('❌ Authentication failed');
                this.showError('Invalid email or password. Please try again.');
            }
            
        } catch (error) {
            console.error('💥 Login error:', error);
            this.showError('Login failed. Please check your connection and try again.');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Validate Form Data
     * 
     * Performs client-side validation of form inputs.
     * 
     * @param {string} email - Email address
     * @param {string} password - Password
     * @returns {boolean} True if valid, false otherwise
     */
    validateForm(email, password) {
        // Check for empty fields
        if (!email || !password) {
            this.showError('Please fill in all fields.');
            return false;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('Please enter a valid email address.');
            return false;
        }
        
        // Password length check
        if (password.length < 3) {
            this.showError('Password must be at least 3 characters long.');
            return false;
        }
        
        return true;
    }

    /**
     * Validate Email Input
     * 
     * Real-time email validation with visual feedback.
     */
    validateEmail() {
        const email = this.emailInput.value.trim();
        const inputGroup = this.emailInput.closest('.input-group');
        
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            inputGroup.classList.add('error');
            inputGroup.classList.remove('success');
        } else if (email) {
            inputGroup.classList.add('success');
            inputGroup.classList.remove('error');
        } else {
            inputGroup.classList.remove('error', 'success');
        }
    }

    /**
     * Validate Password Input
     * 
     * Real-time password validation with visual feedback.
     */
    validatePassword() {
        const password = this.passwordInput.value;
        const inputGroup = this.passwordInput.closest('.input-group');
        
        if (password && password.length < 3) {
            inputGroup.classList.add('error');
            inputGroup.classList.remove('success');
        } else if (password) {
            inputGroup.classList.add('success');
            inputGroup.classList.remove('error');
        } else {
            inputGroup.classList.remove('error', 'success');
        }
    }

    /**
     * Toggle Password Visibility
     * 
     * Shows/hides password text with icon update.
     */
    togglePassword() {
        const isPassword = this.passwordInput.type === 'password';
        this.passwordInput.type = isPassword ? 'text' : 'password';
        
        console.log(`👁️ Password visibility: ${isPassword ? 'shown' : 'hidden'}`);
        
        // Update icon
        const icon = this.passwordToggle.querySelector('svg');
        if (isPassword) {
            // Eye with slash (hidden)
            icon.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            `;
        } else {
            // Regular eye (visible)
            icon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            `;
        }
    }

    /**
     * Fill Demo Account Credentials
     * 
     * Populates form with demo account information.
     * 
     * @param {Event} e - Click event from demo account button
     */
    fillDemoAccount(e) {
        const email = e.currentTarget.dataset.email;
        
        console.log(`🎭 Demo account selected: ${email}`);
        
        // Fill form fields
        this.emailInput.value = email;
        this.passwordInput.value = 'password'; // All demo accounts use 'password'
        
        // Clear any validation states
        document.querySelectorAll('.input-group').forEach(group => {
            group.classList.remove('error', 'success');
        });
        
        // Hide any existing errors
        this.hideError();
        
        // Focus the login button for better UX
        this.loginBtn.focus();
        
        console.log('✅ Demo account credentials filled');
    }

    /**
     * Set Loading State
     * 
     * Shows/hides loading spinner and disables form.
     * 
     * @param {boolean} loading - Whether to show loading state
     */
    setLoading(loading) {
        const spinner = this.loginBtn.querySelector('.loading-spinner');
        const text = this.loginBtn.querySelector('span');
        
        if (loading) {
            console.log('⏳ Showing loading state');
            spinner.style.display = 'block';
            text.style.display = 'none';
            this.loginBtn.disabled = true;
            this.form.classList.add('form-loading');
        } else {
            console.log('✅ Hiding loading state');
            spinner.style.display = 'none';
            text.style.display = 'block';
            this.loginBtn.disabled = false;
            this.form.classList.remove('form-loading');
        }
    }

    /**
     * Show Error Message
     * 
     * Displays error message to user with animation.
     * 
     * @param {string} message - Error message to display
     */
    showError(message) {
        console.log(`❌ Showing error: ${message}`);
        
        this.errorDiv.textContent = message;
        this.errorDiv.style.display = 'block';
        
        // Add shake animation
        this.errorDiv.style.animation = 'none';
        setTimeout(() => {
            this.errorDiv.style.animation = 'shake 0.5s ease-in-out';
        }, 10);
    }

    /**
     * Hide Error Message
     * 
     * Hides the error message display.
     */
    hideError() {
        this.errorDiv.style.display = 'none';
        this.errorDiv.style.animation = 'none';
    }

    /**
     * Show Success State
     * 
     * Updates button to show successful login.
     */
    showSuccess() {
        console.log('🎉 Showing success state');
        
        this.loginBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            <span>Success!</span>
        `;
        this.loginBtn.classList.add('btn-success');
    }
}

// ===========================================
// INITIALIZATION
// ===========================================

/**
 * Initialize Authentication System
 * 
 * Sets up authentication when DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Initializing authentication system');
    
    // Initialize login handler if login form exists
    if (document.getElementById('loginForm')) {
        new LoginHandler();
    }
    
    console.log('✅ Authentication system ready');
});

// ===========================================
// GLOBAL EXPORTS
// ===========================================

// Make AuthService globally available
window.AuthService = AuthService;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthService, LoginHandler };
}

console.log('📜 Authentication module loaded successfully');
