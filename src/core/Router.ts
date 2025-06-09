import { StateManager } from './StateManager';
import { AuthPage } from '../pages/AuthPage';
import { HomePage } from '../pages/HomePage';
import { ActivitiesPage } from '../pages/ActivitiesPage';
import { SkillsPage } from '../pages/SkillsPage';
import { CommunityPage } from '../pages/CommunityPage';
import { ProfilePage } from '../pages/ProfilePage';

export class Router {
  private stateManager: StateManager;
  private routes: Map<string, () => Promise<void>> = new Map();
  private currentPage: any = null;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
    this.setupRoutes();
  }

  init(): void {
    // Handle browser navigation
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });

    // Handle initial route
    this.handleRoute();
  }

  private setupRoutes(): void {
    this.routes.set('auth', () => this.loadPage(AuthPage));
    this.routes.set('home', () => this.loadPage(HomePage));
    this.routes.set('activities', () => this.loadPage(ActivitiesPage));
    this.routes.set('skills', () => this.loadPage(SkillsPage));
    this.routes.set('community', () => this.loadPage(CommunityPage));
    this.routes.set('profile', () => this.loadPage(ProfilePage));
  }

  async navigate(path: string, pushState = true): Promise<void> {
    if (pushState) {
      history.pushState(null, '', `#${path}`);
    }
    
    this.stateManager.setCurrentPage(path);
    await this.handleRoute();
  }

  private async handleRoute(): Promise<void> {
    const hash = window.location.hash.slice(1) || 'home';
    const route = this.routes.get(hash);
    
    if (route) {
      try {
        await route();
      } catch (error) {
        console.error(`Failed to load route ${hash}:`, error);
        await this.navigate('home', false);
      }
    } else {
      await this.navigate('home', false);
    }
  }

  private async loadPage(PageClass: any): Promise<void> {
    const mainApp = document.getElementById('main-app');
    if (!mainApp) return;

    // Cleanup previous page
    if (this.currentPage && typeof this.currentPage.destroy === 'function') {
      this.currentPage.destroy();
    }

    // Create new page instance
    this.currentPage = new PageClass(this.stateManager);
    
    // Render page
    const content = await this.currentPage.render();
    mainApp.innerHTML = content;
    
    // Initialize page
    if (typeof this.currentPage.init === 'function') {
      this.currentPage.init();
    }
  }
}