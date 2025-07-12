// Navigation Service
class NavigationService {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentUser = null;
        this.init();
    }

    init() {
        this.currentUser = AuthService.getCurrentUser();
        this.setupEventListeners();
        this.updateNavigationVisibility();
    }

    setupEventListeners() {
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('[data-page]');
            if (navLink) {
                e.preventDefault();
                const page = navLink.dataset.page;
                this.navigateTo(page);
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || this.getPageFromHash();
            this.navigateTo(page, false);
        });

        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const page = this.getPageFromHash();
            this.navigateTo(page, false);
        });
    }

    getPageFromHash() {
        const hash = window.location.hash.substring(1);
        return hash || 'dashboard';
    }

    navigateTo(page, updateHistory = true) {
        // Validate page access
        if (!this.canAccessPage(page)) {
            page = 'dashboard';
        }

        // Update current page
        this.currentPage = page;

        // Update page visibility
        this.updatePageVisibility(page);

        // Update navigation states
        this.updateNavigationStates(page);

        // Update URL
        if (updateHistory) {
            const url = page === 'dashboard' ? '/' : `#${page}`;
            history.pushState({ page }, '', url);
        }

        // Close mobile menu if open
        this.closeMobileMenu();

        // Dispatch navigation event
        window.dispatchEvent(new CustomEvent('pageChanged', { 
            detail: { page, previousPage: this.previousPage } 
        }));

        this.previousPage = page;
    }

    updatePageVisibility(activePage) {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            const pageId = page.id.replace('Page', '');
            page.classList.toggle('active', pageId === activePage);
        });
    }

    updateNavigationStates(activePage) {
        // Update sidebar navigation
        const sidebarLinks = document.querySelectorAll('.nav-link');
        sidebarLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === activePage);
        });

        // Update bottom navigation
        const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
        bottomNavItems.forEach(item => {
            item.classList.toggle('active', item.dataset.page === activePage);
        });
    }

    updateNavigationVisibility() {
        if (!this.currentUser) return;

        const allowedPages = ROLE_PERMISSIONS[this.currentUser.role] || [];
        
        // Update sidebar navigation
        const sidebarItems = document.querySelectorAll('.nav-item');
        sidebarItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            const page = link?.dataset.page;
            
            if (page && allowedPages.includes(page)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });

        // Update bottom navigation
        const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
        bottomNavItems.forEach(item => {
            const page = item.dataset.page;
            
            if (page && allowedPages.includes(page)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }

    canAccessPage(page) {
        if (!this.currentUser) return false;
        
        const allowedPages = ROLE_PERMISSIONS[this.currentUser.role] || [];
        return allowedPages.includes(page);
    }

    closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    getCurrentPage() {
        return this.currentPage;
    }

    refresh() {
        this.currentUser = AuthService.getCurrentUser();
        this.updateNavigationVisibility();
    }
}

// Initialize navigation service
let navigationService;

document.addEventListener('DOMContentLoaded', () => {
    if (AuthService.isAuthenticated()) {
        navigationService = new NavigationService();
        window.navigationService = navigationService;
    }
});

// Export for use in other files
window.NavigationService = NavigationService;