// Authentication Service
class AuthService {
    static STORAGE_KEY = 'scoutpluse_user';
    static users = null;

    static async loadUsers() {
        if (this.users) return this.users;
        
        try {
            const response = await fetch('/Tamouz-Application/JS/users.json');
            const data = await response.json();
            this.users = {};
            
            data.users.forEach(user => {
                this.users[user.email] = user;
            });
            
            return this.users;
        } catch (error) {
            console.warn('Failed to load users.json, using demo data');
            this.users = DEMO_USERS;
            return this.users;
        }
    }
    static async login(email, password) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const users = await this.loadUsers();
        const user = users[email];
        if (user && user.password === password) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
            return user;
        }
        
        return null;
    }

    static logout() {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    static getCurrentUser() {
        try {
            const storedUser = localStorage.getItem(this.STORAGE_KEY);
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    }

    static isAuthenticated() {
        return this.getCurrentUser() !== null;
    }
}

// Login Form Handler
class LoginHandler {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.loginBtn = document.getElementById('loginBtn');
        this.errorDiv = document.getElementById('loginError');
        this.demoAccounts = document.querySelectorAll('.demo-account');
        
        this.init();
    }

    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.passwordToggle.addEventListener('click', this.togglePassword.bind(this));
        
        this.demoAccounts.forEach(account => {
            account.addEventListener('click', this.fillDemoAccount.bind(this));
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.setLoading(true);
        this.hideError();
        
        const email = this.emailInput.value;
        const password = this.passwordInput.value;
        
        try {
            const user = await AuthService.login(email, password);
            if (user) {
                this.showSuccess();
            setTimeout(() => {
                window.location.href = "/Tamouz-Application/";
                }, 500);
            } else {
                this.showError('Invalid credentials. Try admin@scouts.org / password');
            }
        } catch (error) {
            this.showError('Login failed. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    togglePassword() {
        const isPassword = this.passwordInput.type === 'password';
        this.passwordInput.type = isPassword ? 'text' : 'password';
        
        const icon = this.passwordToggle.querySelector('svg');
        if (isPassword) {
            icon.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            `;
        } else {
            icon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            `;
        }
    }

    fillDemoAccount(e) {
        const email = e.currentTarget.dataset.email;
        this.emailInput.value = email;
        this.passwordInput.value = 'password';
    }

    setLoading(loading) {
        const spinner = this.loginBtn.querySelector('.loading-spinner');
        const text = this.loginBtn.querySelector('span');
        
        if (loading) {
            spinner.style.display = 'block';
            text.style.display = 'none';
            this.loginBtn.disabled = true;
        } else {
            spinner.style.display = 'none';
            text.style.display = 'block';
            this.loginBtn.disabled = false;
        }
    }

    showError(message) {
        this.errorDiv.textContent = message;
        this.errorDiv.style.display = 'block';
    }

    hideError() {
        this.errorDiv.style.display = 'none';
    }

    showSuccess() {
        this.loginBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            <span>Success!</span>
        `;
        this.loginBtn.style.backgroundColor = 'var(--primary-600)';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginForm')) {
        new LoginHandler();
    }
});

// Export for use in other files
window.AuthService = AuthService;
