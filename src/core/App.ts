import { Router } from './Router';
import { StateManager } from './StateManager';
import { AuthManager } from './AuthManager';
import { UIManager } from './UIManager';
import { AppState } from '../types';

export class App {
  private router: Router;
  private stateManager: StateManager;
  private authManager: AuthManager;
  private uiManager: UIManager;

  constructor() {
    this.stateManager = new StateManager();
    this.authManager = new AuthManager(this.stateManager);
    this.router = new Router(this.stateManager);
    this.uiManager = new UIManager(this.stateManager);
  }

  async init(): Promise<void> {
    try {
      // Initialize state
      await this.stateManager.init();
      
      // Initialize UI components
      this.uiManager.init();
      
      // Check authentication status
      const isAuthenticated = await this.authManager.checkAuthStatus();
      
      if (isAuthenticated) {
        // User is logged in, show main app
        await this.showMainApp();
      } else {
        // User is not logged in, show auth screen
        await this.showAuthScreen();
      }
      
      // Initialize router
      this.router.init();
      
      // Hide loading screen
      this.hideLoadingScreen();
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
      throw error;
    }
  }

  private async showMainApp(): Promise<void> {
    const mainApp = document.getElementById('main-app');
    if (mainApp) {
      mainApp.style.display = 'block';
      await this.router.navigate('home');
    }
  }

  private async showAuthScreen(): Promise<void> {
    await this.router.navigate('auth');
  }

  private hideLoadingScreen(): void {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 300);
    }
  }
}