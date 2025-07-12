// Settings Management
class SettingsService {
    constructor() {
        this.currentUser = null;
        this.settings = this.getDefaultSettings();
        this.init();
    }

    init() {
        this.currentUser = AuthService.getCurrentUser();
        this.loadSettings();
        this.loadSettingsPage();
    }

    getDefaultSettings() {
        return {
            theme: 'auto',
            language: 'en',
            privacy: {
                profileVisible: true
            },
            preferences: {
                autoJoinEvents: false,
                emailDigest: 'weekly',
                timezone: 'America/New_York'
            }
        };
    }

    loadSettings() {
        const stored = localStorage.getItem('scoutpluse_settings');
        if (stored) {
            try {
                this.settings = { ...this.getDefaultSettings(), ...JSON.parse(stored) };
            } catch (e) {
                console.warn('Failed to load settings from localStorage');
            }
        }
    }

    saveSettings() {
        localStorage.setItem('scoutpluse_settings', JSON.stringify(this.settings));
        this.showNotification('Settings saved successfully!', 'success');
    }

    loadSettingsPage() {
        const settingsContent = document.getElementById('settingsContent');
        if (!settingsContent || !this.currentUser) return;

        settingsContent.innerHTML = this.getSettingsHTML();
        this.setupEventListeners();
    }

    getSettingsHTML() {
        return `
            <div class="settings-section">
                <h3>Appearance</h3>
                <div class="settings-item">
                    <div class="settings-item-info">
                        <h4>Theme</h4>
                        <p>Choose your preferred color scheme</p>
                    </div>
                    <select id="themeSelect" class="settings-select">
                        <option value="light" ${this.settings.theme === 'light' ? 'selected' : ''}>Light</option>
                        <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                        <option value="auto" ${this.settings.theme === 'auto' ? 'selected' : ''}>Auto (System)</option>
                    </select>
                </div>
                
                <div class="settings-item">
                    <div class="settings-item-info">
                        <h4>Language</h4>
                        <p>Select your preferred language</p>
                    </div>
                    <select id="languageSelect" class="settings-select">
                        <option value="en" ${this.settings.language === 'en' ? 'selected' : ''}>English</option>
                        <option value="ar" ${this.settings.language === 'ar' ? 'selected' : ''}>العربية (Arabic)</option>
                    </select>
                </div>
            </div>


            ${this.currentUser.role === 'admin' ? this.getAdminSettingsHTML() : ''}

            <div class="settings-section">
                <h3>Account</h3>
                <div class="settings-actions">
                    <button class="btn btn-outline" onclick="window.settingsService.exportData()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7,10 12,15 17,10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Export Data
                    </button>
                    
                    <button class="btn btn-outline" onclick="window.settingsService.resetSettings()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="1,4 1,10 7,10"></polyline>
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                        </svg>
                        Reset Settings
                    </button>
                    
                    <button class="btn btn-outline" style="color: var(--red-600); border-color: var(--red-600);" onclick="window.settingsService.deleteAccount()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete Account
                    </button>
                </div>
            </div>

            <div class="settings-section">
                <div style="text-align: center; padding: var(--spacing-4); background: var(--bg-secondary); border-radius: var(--radius-xl);">
                    <h4 style="margin-bottom: var(--spacing-2);">ScoutPluse</h4>
                    <p style="color: var(--text-muted); font-size: var(--font-size-sm);">Version 1.0.0</p>
                    <p style="color: var(--text-muted); font-size: var(--font-size-xs); margin-top: var(--spacing-2);">
                        Built with ❤️ for the scouting community
                    </p>
                </div>
            </div>
        `;
    }

    getAdminSettingsHTML() {
        return `
            <div class="settings-section">
                <h3>Administration</h3>
                <div class="settings-item">
                    <div class="settings-item-info">
                        <h4>Troop Management</h4>
                        <p>Manage troop settings and member permissions</p>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="window.settingsService.manageTroop()">
                        Manage
                    </button>
                </div>
                
                <div class="settings-item">
                    <div class="settings-item-info">
                        <h4>System Backup</h4>
                        <p>Create and manage system backups</p>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="window.settingsService.createBackup()">
                        Backup
                    </button>
                </div>
                
                <div class="settings-item">
                    <div class="settings-item-info">
                        <h4>User Reports</h4>
                        <p>Generate reports on user activity and engagement</p>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="window.settingsService.generateReports()">
                        Reports
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Toggle switches
        const toggles = document.querySelectorAll('.toggle-switch[data-setting]');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', this.handleToggle.bind(this));
        });

        // Select dropdowns
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', this.handleThemeChange.bind(this));
        }

        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.addEventListener('change', this.handleLanguageChange.bind(this));
        }

        const emailDigestSelect = document.getElementById('emailDigestSelect');
        if (emailDigestSelect) {
            emailDigestSelect.addEventListener('change', this.handleEmailDigestChange.bind(this));
        }

        const timezoneSelect = document.getElementById('timezoneSelect');
        if (timezoneSelect) {
            timezoneSelect.addEventListener('change', this.handleTimezoneChange.bind(this));
        }
    }

    handleToggle(e) {
        const toggle = e.currentTarget;
        const settingPath = toggle.dataset.setting;
        
        toggle.classList.toggle('active');
        const isActive = toggle.classList.contains('active');
        
        this.setSetting(settingPath, isActive);
        this.saveSettings();
    }

    handleThemeChange(e) {
        const theme = e.target.value;
        this.settings.theme = theme;
        this.saveSettings();
        
        // Apply theme immediately
        const themeService = window.getThemeService?.();
        if (themeService) {
            if (theme === 'auto') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                themeService.setTheme(systemTheme);
            } else {
                themeService.setTheme(theme);
            }
        }
    }

    handleLanguageChange(e) {
        const language = e.target.value;
        this.settings.language = language;
        this.saveSettings();
        
        // Apply language immediately
        const translationService = window.getTranslationService?.();
        if (translationService) {
            translationService.setLanguage(language);
        }
    }

    handleEmailDigestChange(e) {
        this.settings.preferences.emailDigest = e.target.value;
        this.saveSettings();
    }

    handleTimezoneChange(e) {
        this.settings.preferences.timezone = e.target.value;
        this.saveSettings();
    }

    setSetting(path, value) {
        const keys = path.split('.');
        let current = this.settings;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
    }

    // Admin functions
    manageTroop() {
        alert('Troop Management feature coming soon!\n\nThis would allow managing troop settings, member roles, and permissions.');
    }

    createBackup() {
        alert('System Backup feature coming soon!\n\nThis would create a backup of all troop data and settings.');
    }

    generateReports() {
        alert('User Reports feature coming soon!\n\nThis would generate detailed reports on member activity and engagement.');
    }

    // Account functions
    exportData() {
        const data = {
            user: this.currentUser,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scoutpluse-data-${this.currentUser.name.replace(/\s+/g, '-').toLowerCase()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully!', 'success');
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
            this.settings = this.getDefaultSettings();
            this.saveSettings();
            this.loadSettingsPage();
            this.showNotification('Settings reset to default', 'info');
        }
    }

    deleteAccount() {
        const confirmation = prompt('This will permanently delete your account and all associated data. Type "DELETE" to confirm:');
        if (confirmation === 'DELETE') {
            alert('Account deletion feature coming soon!\n\nThis would permanently delete your account and all data.');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    refresh() {
        this.loadSettingsPage();
    }

    getSettings() {
        return this.settings;
    }

    getSetting(path) {
        const keys = path.split('.');
        let current = this.settings;
        
        for (const key of keys) {
            if (current[key] === undefined) {
                return undefined;
            }
            current = current[key];
        }
        
        return current;
    }
}

// Add CSS for settings-specific styles
const settingsStyles = `
<style>
.settings-select {
    padding: var(--spacing-2) var(--spacing-3);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
    min-width: 150px;
}

.settings-select:focus {
    outline: none;
    border-color: var(--primary-500);
}

.settings-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-3);
}

@media (max-width: 768px) {
    .settings-actions {
        flex-direction: column;
    }
    
    .settings-actions .btn {
        justify-content: center;
    }
}
</style>
`;

// Inject settings styles
document.head.insertAdjacentHTML('beforeend', settingsStyles);

// Initialize settings service when page loads
let settingsService;

document.addEventListener('DOMContentLoaded', () => {
    if (AuthService.isAuthenticated()) {
        settingsService = new SettingsService();
        window.settingsService = settingsService;
    }
});

// Export for use in other files
window.SettingsService = SettingsService;