import { CreativeCommons as createIcons } from 'lucide';
import { App } from './core/App';
import { ThemeManager } from './core/ThemeManager';
import { PWAManager } from './core/PWAManager';
import './styles/main.css';

// Initialize the application
async function initApp(): Promise<void> {
  try {
    // Initialize theme manager
    ThemeManager.init();
    
    // Initialize PWA features
    PWAManager.init();
    
    // Initialize Lucide icons
    createIcons();
    
    // Initialize main app
    const app = new App();
    await app.init();
    
    console.log('🚀 Scout App initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    
    // Show error message to user
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-screen';
    errorDiv.innerHTML = `
      <div class="error-content">
        <h2>حدث خطأ في تحميل التطبيق</h2>
        <p>يرجى إعادة تحميل الصفحة أو المحاولة لاحقاً</p>
        <button onclick="window.location.reload()" class="btn btn-primary">
          إعادة تحميل
        </button>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}