/* 
===========================================
SCOUTPLUSE - MAIN APPLICATION CONTROLLER
===========================================

This is the main JavaScript file that orchestrates the entire ScoutPluse application.
It handles:
1. Application initialization and setup
2. Authentication state management
3. Navigation between pages
4. Mobile menu functionality
5. Theme management
6. User interface updates
7. Service coordination

The application follows a modular architecture where each major feature
(auth, events, profile, etc.) has its own service class.
*/

/**
 * Main Application Controller Class
 * 
 * This class serves as the central coordinator for the entire application.
 * It manages the overall application state, handles navigation, and
 * coordinates between different services.
 */
class ScoutPluseApp {
    constructor() {
        // Current authenticated user
        this.currentUser = null;
        
        // Current active page
        this.currentPage = 'dashboard';
        
        // Registry of all application services
        this.services = {};
        
        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application
     * Sets up all core functionality and checks authentication
     */
    init() {
        console.log('🚀 Initializing ScoutPluse Application...');
        
        // Check if user is authenticated
        this.checkAuthentication();
        
        // Set up event listeners for UI interactions
        this.setupEventListeners();
        
        // Initialize all application services
        this.initializeServices();
        
        // Set up navigation system
        this.setupNavigation();
        
        // Set up mobile menu functionality
        this.setupMobileMenu();
        
        // Initialize theme system
        this.setupTheme();
        
        // Set up internationalization
        this.setupTranslations();
        
        console.log('✅ ScoutPluse Application initialized successfully');
    }

    /**
     * Check Authentication Status
     * Determines if user is logged in and shows appropriate interface
     */
    checkAuthentication() {
        console.log('🔐 Checking authentication status...');
        
        // Get current user from AuthService
        this.currentUser = AuthService.getCurrentUser();
        
        if (this.currentUser) {
            console.log(`👤 User authenticated: ${this.currentUser.name} (${this.currentUser.role})`);
            this.showMainApp();
            this.updateUserInterface();
            // Initialize mobile back button for current page
            this.updateMobileBackButton(this.currentPage);
        } else {
            console.log('🔒 No authenticated user found, showing login screen');
            this.showLoginScreen();
        }
    }

    /**
     * Show Login Screen
     * Displays the authentication interface
     */
    showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen) loginScreen.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
        
        console.log('📱 Login screen displayed');
    }

    /**
     * Show Main Application
     * Displays the main application interface after successful authentication
     */
    showMainApp() {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen) loginScreen.style.display = 'none';
        if (mainApp) mainApp.style.display = 'flex';
        
        console.log('🏠 Main application displayed');
    }

    /**
     * Update User Interface
     * Updates UI elements with current user information
     */
    updateUserInterface() {
        if (!this.currentUser) {
            console.warn('⚠️ Cannot update UI: No current user');
            return;
        }

        console.log('🎨 Updating user interface...');

        // Update user avatars with first letter of name
        const userAvatars = document.querySelectorAll('#userAvatar, #mobileUserAvatar');
        userAvatars.forEach(avatar => {
            avatar.textContent = this.currentUser.name.charAt(0).toUpperCase();
        });

        // Update user name and role in sidebar
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        
        if (userName) userName.textContent = this.currentUser.name;
        if (userRole) userRole.textContent = this.capitalizeRole(this.currentUser.role);

        // Update welcome message on dashboard
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome back, ${this.currentUser.name}!`;
        }

        // Update navigation based on user role permissions
        this.updateNavigationForRole();
        
        console.log('✅ User interface updated successfully');
    }

    /**
     * Update Navigation for User Role
     * Shows/hides navigation items based on user permissions
     */
    updateNavigationForRole() {
        const allowedPages = ROLE_PERMISSIONS[this.currentUser.role] || [];
        const navItems = document.querySelectorAll('.nav-item, .bottom-nav-item');
        
        console.log(`🔐 Updating navigation for role: ${this.currentUser.role}`);
        console.log(`📋 Allowed pages: ${allowedPages.join(', ')}`);
        
        navItems.forEach(item => {
            const link = item.querySelector('a') || item;
            const page = link.dataset.page;
            
            if (allowedPages.includes(page)) {
                item.style.display = '';
                console.log(`✅ Showing navigation item: ${page}`);
            } else {
                item.style.display = 'none';
                console.log(`❌ Hiding navigation item: ${page}`);
            }
        });
    }

    /**
     * Setup Event Listeners
     * Attaches event handlers for core application functionality
     */
    setupEventListeners() {
        console.log('🎧 Setting up event listeners...');
        
        // Logout button functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
            console.log('🚪 Logout button listener attached');
        }
        
        // Mobile back button functionality
        const mobileBackBtn = document.getElementById('mobileBackBtn');
        if (mobileBackBtn) {
            mobileBackBtn.addEventListener('click', this.handleMobileBack.bind(this));
            console.log('⬅️ Mobile back button listener attached');
        }

        // Listen for authentication changes in other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'scoutpluse_user') {
                console.log('🔄 Authentication change detected in another tab');
                this.checkAuthentication();
            }
        });
        
        // Setup troop members modal
        const troopMembersModal = document.getElementById('troopMembersModal');
        const closeTroopMembersModal = document.getElementById('closeTroopMembersModal');
        
        if (closeTroopMembersModal) {
            closeTroopMembersModal.addEventListener('click', () => {
                troopMembersModal.style.display = 'none';
            });
        }
        
        if (troopMembersModal) {
            troopMembersModal.addEventListener('click', (e) => {
                if (e.target === troopMembersModal) {
                    troopMembersModal.style.display = 'none';
                }
            });
        }
        
        console.log('✅ Event listeners setup complete');
    }

    /**
     * Setup Navigation System
     * Handles page navigation and URL routing
     */
    setupNavigation() {
        console.log('🧭 Setting up navigation system...');
        
        // Sidebar navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                console.log(`🔗 Sidebar navigation clicked: ${page}`);
                this.navigateToPage(page);
            });
        });

        // Bottom navigation (mobile)
        const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
        bottomNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                console.log(`📱 Bottom navigation clicked: ${page}`);
                this.navigateToPage(page);
            });
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || 'dashboard';
            console.log(`⬅️ Browser navigation: ${page}`);
            this.navigateToPage(page, false);
        });

        // Set initial page from URL hash
        const hash = window.location.hash.substring(1);
        if (hash && ROLE_PERMISSIONS[this.currentUser?.role]?.includes(hash)) {
            console.log(`🔗 Initial page from URL: ${hash}`);
            this.navigateToPage(hash, false);
        }
        
        console.log('✅ Navigation system setup complete');
    }

    /**
     * Navigate to Page
     * Handles page transitions and URL updates
     * 
     * @param {string} page - The page to navigate to
     * @param {boolean} updateHistory - Whether to update browser history
     */
    navigateToPage(page, updateHistory = true) {
        console.log(`🚀 Navigating to page: ${page}`);
        
        // Check if user has permission to access this page
        const allowedPages = ROLE_PERMISSIONS[this.currentUser?.role] || [];
        if (!allowedPages.includes(page)) {
            console.warn(`⚠️ Access denied to page: ${page}. Redirecting to dashboard.`);
            page = 'dashboard';
        }

        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(p => {
            p.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(`${page}Page`);
        if (targetPage) {
            targetPage.classList.add('active');
            console.log(`✅ Page displayed: ${page}`);
        } else {
            console.error(`❌ Page not found: ${page}Page`);
        }

        // Update navigation active states
        this.updateNavigationActiveStates(page);

        // Update browser URL
        if (updateHistory) {
            const url = page === 'dashboard' ? '/' : `#${page}`;
            history.pushState({ page }, '', url);
            console.log(`🔗 URL updated: ${url}`);
        }

        // Close mobile menu if open
        this.closeMobileMenu();
        
        // Update mobile back button visibility
        this.updateMobileBackButton(page);

        // Refresh page content
        this.refreshPageContent(page);

        // Update current page
        this.currentPage = page;
        
        console.log(`✅ Navigation complete: ${page}`);
    }

    /**
     * Update Navigation Active States
     * Updates visual indicators for current page
     * 
     * @param {string} page - The currently active page
     */
    updateNavigationActiveStates(page) {
        // Update sidebar navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        // Update bottom navigation
        const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
        bottomNavItems.forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        console.log(`🎯 Navigation active states updated for: ${page}`);
    }

    /**
     * Update Mobile Back Button
     * Shows/hides the back button based on current page
     * 
     * @param {string} page - The currently active page
     */
    updateMobileBackButton(page) {
        const mobileBackBtn = document.getElementById('mobileBackBtn');
        if (!mobileBackBtn) return;
        
        // Show back button on all pages except dashboard
        if (page === 'dashboard') {
            mobileBackBtn.classList.remove('visible');
        } else {
            mobileBackBtn.classList.add('visible');
        }
        
        console.log(`⬅️ Mobile back button ${page === 'dashboard' ? 'hidden' : 'shown'}`);
    }
    
    /**
     * Handle Mobile Back Button
     * Navigates back to dashboard or previous page
     */
    handleMobileBack() {
        console.log('⬅️ Mobile back button clicked');
        
        // For now, always go back to dashboard
        // In the future, this could implement a proper back stack
        this.navigateToPage('dashboard');
    }

    /**
     * Setup Mobile Menu
     * Handles mobile sidebar functionality
     */
    setupMobileMenu() {
        console.log('📱 Setting up mobile menu...');
        
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebarClose = document.getElementById('sidebarClose');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const sidebar = document.getElementById('sidebar');

        // Open mobile menu
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                console.log('📱 Opening mobile menu');
                this.openMobileMenu();
            });
        }

        // Close mobile menu
        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => {
                console.log('📱 Closing mobile menu (close button)');
                this.closeMobileMenu();
            });
        }

        // Close menu when clicking overlay
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                console.log('📱 Closing mobile menu (overlay click)');
                this.closeMobileMenu();
            });
        }

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar?.classList.contains('open')) {
                console.log('📱 Closing mobile menu (escape key)');
                this.closeMobileMenu();
            }
        });
        
        console.log('✅ Mobile menu setup complete');
    }

    /**
     * Open Mobile Menu
     * Shows the mobile sidebar
     */
    openMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = 'hidden';
        
        console.log('📱 Mobile menu opened');
    }

    /**
     * Close Mobile Menu
     * Hides the mobile sidebar
     */
    closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        console.log('📱 Mobile menu closed');
    }

    /**
     * Setup Theme System
     * Initializes theme management and toggle functionality
     */
    setupTheme() {
        console.log('🎨 Setting up theme system...');
        
        // Theme is already initialized in the HTML head
        this.setupThemeToggle();
        
        console.log('✅ Theme system setup complete');
    }

    /**
     * Setup Theme Toggle
     * Handles theme switching and scroll-to-top functionality
     */
    setupThemeToggle() {
        const themeToggle = document.getElementById('mobileThemeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const themeService = window.getThemeService?.();
                if (themeService) {
                    const newTheme = themeService.toggleTheme();
                    this.updateThemeIcon(newTheme);
                    console.log(`🎨 Theme toggled to: ${newTheme}`);
                }
            });
            
            // Set initial icon
            const themeService = window.getThemeService?.();
            if (themeService) {
                this.updateThemeIcon(themeService.getTheme());
            }
        }
        
        // Setup scroll to top button
        this.setupScrollToTop();
    }

    /**
     * Update Theme Icon
     * Changes the theme toggle button icon based on current theme
     * 
     * @param {string} theme - Current theme (light/dark/auto)
     */
    updateThemeIcon(theme) {
        const themeToggle = document.getElementById('mobileThemeToggle');
        if (!themeToggle) return;
        
        const isDark = document.documentElement.classList.contains('dark');
        const icon = themeToggle.querySelector('svg');
        
        if (isDark) {
            // Moon icon for dark mode
            icon.innerHTML = `
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            `;
        } else {
            // Sun icon for light mode
            icon.innerHTML = `
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            `;
        }
        
        console.log(`🎨 Theme icon updated for ${isDark ? 'dark' : 'light'} mode`);
    }

    /**
     * Setup Scroll to Top Button
     * Handles the floating scroll-to-top functionality
     */
    setupScrollToTop() {
        const scrollToTopBtn = document.getElementById('scrollToTop');
        if (!scrollToTopBtn) return;
        
        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });
        
        // Scroll to top when clicked
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            console.log('⬆️ Scrolled to top');
        });
        
        console.log('⬆️ Scroll to top button setup complete');
    }

    /**
     * Setup Translations
     * Initializes internationalization system
     */
    setupTranslations() {
        console.log('🌐 Setting up translations...');
        
        // Translations are handled by the translation service
        // This method can be extended for additional translation setup
        
        console.log('✅ Translations setup complete');
    }

    /**
     * Initialize Services
     * Coordinates the initialization of all application services
     */
    initializeServices() {
        console.log('⚙️ Initializing application services...');
        
        // Services are initialized by their respective files
        // This method can be used to coordinate service initialization
        // and register services in the services registry
        
        console.log('✅ Services initialization complete');
    }

    /**
     * Refresh Page Content
     * Triggers content refresh for the specified page
     * 
     * @param {string} page - The page to refresh
     */
    refreshPageContent(page) {
        console.log(`🔄 Refreshing content for page: ${page}`);
        
        // Refresh content based on the current page
        switch (page) {
            case 'dashboard':
                if (window.dashboardService) {
                    window.dashboardService.refresh();
                    console.log('✅ Dashboard content refreshed');
                }
                break;
                
            case 'events':
                if (window.eventsService) {
                    window.eventsService.refresh();
                    console.log('✅ Events content refreshed');
                }
                break;
                
            case 'information':
                if (window.informationService) {
                    window.informationService.refresh();
                    console.log('✅ Information content refreshed');
                }
                break;
                
            case 'profile':
                if (window.profileService) {
                    window.profileService.refresh();
                    console.log('✅ Profile content refreshed');
                }
                break;
                
            case 'settings':
                if (window.settingsService) {
                    window.settingsService.refresh();
                    console.log('✅ Settings content refreshed');
                }
                break;
                
            default:
                console.log(`ℹ️ No refresh handler for page: ${page}`);
        }
    }

    /**
     * Handle Logout
     * Processes user logout and cleans up application state
     */
    handleLogout() {
        console.log('🚪 Logout requested');
        
        if (confirm('Are you sure you want to logout?')) {
            console.log('✅ Logout confirmed');
            
            // Clear authentication
            AuthService.logout();
            this.currentUser = null;
            
            // Show login screen
            this.showLoginScreen();
            
            // Clear any cached data
            this.services = {};
            
            // Reset to default page
            this.currentPage = 'dashboard';
            history.replaceState(null, '', '/');
            
            console.log('✅ Logout completed successfully');
        } else {
            console.log('❌ Logout cancelled');
        }
    }

    /**
     * Capitalize Role
     * Utility function to format role names
     * 
     * @param {string} role - The role to capitalize
     * @returns {string} Capitalized role name
     */
    capitalizeRole(role) {
        return role.charAt(0).toUpperCase() + role.slice(1);
    }

    // ===========================================
    // PUBLIC API METHODS
    // ===========================================
    // These methods provide external access to application state

    /**
     * Get Current User
     * @returns {Object|null} Current authenticated user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Get Current Page
     * @returns {string} Currently active page
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Get Service
     * Retrieves a registered service by name
     * 
     * @param {string} serviceName - Name of the service to retrieve
     * @returns {Object|undefined} The requested service
     */
    getService(serviceName) {
        return this.services[serviceName];
    }

    /**
     * Register Service
     * Adds a service to the services registry
     * 
     * @param {string} serviceName - Name of the service
     * @param {Object} service - The service instance
     */
    registerService(serviceName, service) {
        this.services[serviceName] = service;
        console.log(`📝 Service registered: ${serviceName}`);
    }
}

// ===========================================
// APPLICATION INITIALIZATION
// ===========================================

/**
 * Global application instance
 * This will be available throughout the application
 */
let scoutPluseApp;

/**
 * Initialize the application when DOM is ready
 * This ensures all HTML elements are available before setup
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM Content Loaded - Starting ScoutPluse...');
    
    // Create and initialize the main application
    scoutPluseApp = new ScoutPluseApp();
    
    // Make application globally accessible
    window.scoutPluseApp = scoutPluseApp;
    
    console.log('🎉 ScoutPluse Application Ready!');
});

// ===========================================
// GLOBAL EXPORTS
// ===========================================

// Export the main application class for use in other files
window.ScoutPluseApp = ScoutPluseApp;

// ===========================================
// ERROR HANDLING
// ===========================================

/**
 * Global error handler for unhandled JavaScript errors
 */
window.addEventListener('error', (event) => {
    console.error('💥 Global Error:', event.error);
    
    // In production, you might want to send this to an error reporting service
    // For now, we'll just log it to the console
});

/**
 * Global handler for unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 Unhandled Promise Rejection:', event.reason);
    
    // Prevent the default browser behavior (logging to console)
    event.preventDefault();
});

console.log('📜 Main application script loaded successfully');