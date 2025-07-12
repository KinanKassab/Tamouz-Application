// Main Application Controller
class ScoutPluseApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.services = {};
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.initializeServices();
        this.setupNavigation();
        this.setupMobileMenu();
        this.setupTheme();
        this.setupTranslations();
    }

    checkAuthentication() {
        this.currentUser = AuthService.getCurrentUser();
        
        if (this.currentUser) {
            this.showMainApp();
            this.updateUserInterface();
        } else {
            this.showLoginScreen();
        }
    }

    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
    }

    showMainApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'flex';
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        // Update user avatars
        const userAvatars = document.querySelectorAll('#userAvatar, #mobileUserAvatar');
        userAvatars.forEach(avatar => {
            avatar.textContent = this.currentUser.name.charAt(0).toUpperCase();
        });

        // Update user name and role
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        
        if (userName) userName.textContent = this.currentUser.name;
        if (userRole) userRole.textContent = this.capitalizeRole(this.currentUser.role);

        // Update welcome message
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome back, ${this.currentUser.name}!`;
        }

        // Update navigation based on role
        this.updateNavigationForRole();
    }

    updateNavigationForRole() {
        const allowedPages = ROLE_PERMISSIONS[this.currentUser.role] || [];
        const navItems = document.querySelectorAll('.nav-item, .bottom-nav-item');
        
        navItems.forEach(item => {
            const link = item.querySelector('a') || item;
            const page = link.dataset.page;
            
            if (allowedPages.includes(page)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }

        // Page refresh on authentication change
        window.addEventListener('storage', (e) => {
            if (e.key === 'scoutpluse_user') {
                this.checkAuthentication();
            }
        });
    }

    setupNavigation() {
        // Sidebar navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Bottom navigation
        const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
        bottomNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || 'dashboard';
            this.navigateToPage(page, false);
        });

        // Set initial page from URL hash
        const hash = window.location.hash.substring(1);
        if (hash && ROLE_PERMISSIONS[this.currentUser?.role]?.includes(hash)) {
            this.navigateToPage(hash, false);
        }
    }

    navigateToPage(page, updateHistory = true) {
        // Check permissions
        const allowedPages = ROLE_PERMISSIONS[this.currentUser?.role] || [];
        if (!allowedPages.includes(page)) {
            page = 'dashboard';
        }

        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(p => p.classList.remove('active'));

        // Show target page
        const targetPage = document.getElementById(`${page}Page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update navigation active states
        this.updateNavigationActiveStates(page);

        // Update URL
        if (updateHistory) {
            history.pushState({ page }, '', `#${page}`);
        }

        // Close mobile menu
        this.closeMobileMenu();

        // Refresh page content
        this.refreshPageContent(page);

        this.currentPage = page;
    }

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
    }

    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebarClose = document.getElementById('sidebarClose');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const sidebar = document.getElementById('sidebar');

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', this.openMobileMenu.bind(this));
        }

        if (sidebarClose) {
            sidebarClose.addEventListener('click', this.closeMobileMenu.bind(this));
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', this.closeMobileMenu.bind(this));
        }

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar?.classList.contains('open')) {
                this.closeMobileMenu();
            }
        });
    }

    openMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    setupTheme() {
        // Theme is already initialized in the HTML head
        // Additional theme setup can be added here if needed
    }

    setupTranslations() {
        // Translations will be handled by the translation service
        // This is a placeholder for future implementation
    }

    initializeServices() {
        // Services will be initialized by their respective files
        // This method can be used to coordinate service initialization
    }

    refreshPageContent(page) {
        // Refresh content for the current page
        switch (page) {
            case 'dashboard':
                if (window.dashboardService) {
                    window.dashboardService.refresh();
                }
                break;
            case 'events':
                if (window.eventsService) {
                    window.eventsService.refresh();
                }
                break;
            case 'information':
                if (window.informationService) {
                    window.informationService.refresh();
                }
                break;
            case 'members':
                if (window.membersService) {
                    window.membersService.refresh();
                }
                break;
            case 'profile':
                if (window.profileService) {
                    window.profileService.refresh();
                }
                break;
            case 'settings':
                if (window.settingsService) {
                    window.settingsService.refresh();
                }
                break;
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            AuthService.logout();
            this.currentUser = null;
            this.showLoginScreen();
            
            // Clear any cached data
            this.services = {};
            
            // Reset to default page
            this.currentPage = 'dashboard';
            history.replaceState(null, '', '/');
        }
    }

    capitalizeRole(role) {
        return role.charAt(0).toUpperCase() + role.slice(1);
    }

    // Public methods for external access
    getCurrentUser() {
        return this.currentUser;
    }

    getCurrentPage() {
        return this.currentPage;
    }

    getService(serviceName) {
        return this.services[serviceName];
    }
}

// Initialize the application when DOM is loaded
let scoutPluseApp;

document.addEventListener('DOMContentLoaded', () => {
    scoutPluseApp = new ScoutPluseApp();
    window.scoutPluseApp = scoutPluseApp;
});

// Export for use in other files
window.ScoutPluseApp = ScoutPluseApp;