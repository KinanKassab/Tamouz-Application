// Theme Management Service
class ThemeService {
    constructor() {
        this.currentTheme = 'auto';
        this.init();
    }

    init() {
        this.loadTheme();
        this.setupMediaQueryListener();
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('scoutpluse_theme') || 'auto';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('scoutpluse_theme', theme);
        
        const html = document.documentElement;
        
        if (theme === 'dark') {
            html.classList.add('dark');
        } else if (theme === 'light') {
            html.classList.remove('dark');
        } else if (theme === 'auto') {
            // Auto theme - follow system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                html.classList.add('dark');
            } else {
                html.classList.remove('dark');
            }
        }
        
        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme, isDark: html.classList.contains('dark') } 
        }));
    }

    setupMediaQueryListener() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addEventListener('change', (e) => {
            if (this.currentTheme === 'auto') {
                const html = document.documentElement;
                if (e.matches) {
                    html.classList.add('dark');
                } else {
                    html.classList.remove('dark');
                }
                
                // Dispatch theme change event
                window.dispatchEvent(new CustomEvent('themeChanged', { 
                    detail: { theme: 'auto', isDark: e.matches } 
                }));
            }
        });
    }

    getTheme() {
        return this.currentTheme;
    }

    isDarkMode() {
        return document.documentElement.classList.contains('dark');
    }

    toggleTheme() {
        const currentTheme = this.getTheme();
        let newTheme;
        
        if (currentTheme === 'light') {
            newTheme = 'dark';
        } else if (currentTheme === 'dark') {
            newTheme = 'auto';
        } else {
            newTheme = 'light';
        }
        
        this.setTheme(newTheme);
        return newTheme;
    }
}

// Initialize theme service
let themeService;

document.addEventListener('DOMContentLoaded', () => {
    themeService = new ThemeService();
    window.themeService = themeService;
});

// Export getter function for use in other files
window.getThemeService = () => themeService;

// Export for use in other files
window.ThemeService = ThemeService;