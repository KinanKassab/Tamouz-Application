// Translation Service
class TranslationService {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.init();
    }

    init() {
        this.loadTranslations();
        this.loadLanguage();
    }

    loadTranslations() {
        this.translations = {
            en: {
                // Navigation
                'nav.dashboard': 'Dashboard',
                'nav.events': 'Events',
                'nav.information': 'Information',
                'nav.members': 'Members',
                'nav.profile': 'Profile',
                'nav.settings': 'Settings',
                
                // Dashboard
                'dashboard.welcome': 'Welcome back',
                'dashboard.subtitle': "Here's what's happening with your troop today.",
                'dashboard.upcoming_events': 'Upcoming Events',
                'dashboard.active_members': 'Active Members',
                'dashboard.information_items': 'Information Items',
                'dashboard.recent_events': 'Recent Events',
                
                // Events
                'events.title': 'Events',
                'events.create': 'Create Event',
                'events.upcoming': 'Upcoming',
                'events.past': 'Past',
                'events.join': 'Join Event',
                
                // Information
                'information.title': 'Information',
                'information.subtitle': 'Scouting knowledge and resources',
                
                // Members
                'members.title': 'Members',
                'members.add': 'Add Member',
                
                // Profile
                'profile.title': 'Profile',
                'profile.subtitle': 'Manage your personal information and preferences',
                
                // Settings
                'settings.title': 'Settings',
                'settings.subtitle': 'Customize your experience and manage preferences',
                
                // Common
                'common.filter': 'Filter',
                'common.search': 'Search',
                'common.view': 'View',
                'common.edit': 'Edit',
                'common.delete': 'Delete',
                'common.save': 'Save',
                'common.cancel': 'Cancel',
                'common.loading': 'Loading...',
                'common.error': 'Error',
                'common.success': 'Success'
            },
            ar: {
                // Navigation
                'nav.dashboard': 'لوحة التحكم',
                'nav.events': 'الفعاليات',
                'nav.information': 'المعلومات',
                'nav.members': 'الأعضاء',
                'nav.profile': 'الملف الشخصي',
                'nav.settings': 'الإعدادات',
                
                // Dashboard
                'dashboard.welcome': 'مرحباً بعودتك',
                'dashboard.subtitle': 'إليك ما يحدث مع فرقتك اليوم.',
                'dashboard.upcoming_events': 'الفعاليات القادمة',
                'dashboard.active_members': 'الأعضاء النشطون',
                'dashboard.information_items': 'عناصر المعلومات',
                'dashboard.recent_events': 'الفعاليات الأخيرة',
                
                // Events
                'events.title': 'الفعاليات',
                'events.create': 'إنشاء فعالية',
                'events.upcoming': 'القادمة',
                'events.past': 'السابقة',
                'events.join': 'انضم للفعالية',
                
                // Information
                'information.title': 'المعلومات',
                'information.subtitle': 'معرفة ومصادر الكشافة',
                
                // Members
                'members.title': 'الأعضاء',
                'members.add': 'إضافة عضو',
                
                // Profile
                'profile.title': 'الملف الشخصي',
                'profile.subtitle': 'إدارة معلوماتك الشخصية وتفضيلاتك',
                
                // Settings
                'settings.title': 'الإعدادات',
                'settings.subtitle': 'تخصيص تجربتك وإدارة التفضيلات',
                
                // Common
                'common.filter': 'تصفية',
                'common.search': 'بحث',
                'common.view': 'عرض',
                'common.edit': 'تعديل',
                'common.delete': 'حذف',
                'common.save': 'حفظ',
                'common.cancel': 'إلغاء',
                'common.loading': 'جاري التحميل...',
                'common.error': 'خطأ',
                'common.success': 'نجح'
            }
        };
    }

    loadLanguage() {
        const savedLanguage = localStorage.getItem('scoutpluse_language') || 'en';
        this.setLanguage(savedLanguage);
    }

    setLanguage(language) {
        if (!this.translations[language]) {
            console.warn(`Language ${language} not supported, falling back to English`);
            language = 'en';
        }
        
        this.currentLanguage = language;
        localStorage.setItem('scoutpluse_language', language);
        
        // Update HTML lang attribute
        document.documentElement.lang = language;
        
        // Update HTML dir attribute for RTL languages
        if (language === 'ar') {
            document.documentElement.dir = 'rtl';
            document.body.classList.add('rtl');
        } else {
            document.documentElement.dir = 'ltr';
            document.body.classList.remove('rtl');
        }
        
        // Update all translated elements
        this.updateTranslatedElements();
        
        // Dispatch language change event
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language, isRTL: language === 'ar' } 
        }));
    }

    updateTranslatedElements() {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.dataset.translate;
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
    }

    t(key, params = {}) {
        const translation = this.translations[this.currentLanguage]?.[key] || 
                          this.translations['en']?.[key] || 
                          key;
        
        // Simple parameter replacement
        return translation.replace(/\{\{(\w+)\}\}/g, (match, param) => {
            return params[param] || match;
        });
    }

    getLanguage() {
        return this.currentLanguage;
    }

    isRTL() {
        return this.currentLanguage === 'ar';
    }

    getSupportedLanguages() {
        return Object.keys(this.translations);
    }

    addTranslations(language, translations) {
        if (!this.translations[language]) {
            this.translations[language] = {};
        }
        
        Object.assign(this.translations[language], translations);
        
        // Update elements if this is the current language
        if (language === this.currentLanguage) {
            this.updateTranslatedElements();
        }
    }
}

// Initialize translation service
let translationService;

document.addEventListener('DOMContentLoaded', () => {
    translationService = new TranslationService();
    window.translationService = translationService;
});

// Export getter function for use in other files
window.getTranslationService = () => translationService;

// Export for use in other files
window.TranslationService = TranslationService;