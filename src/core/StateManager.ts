import { AppState, User } from '../types';

export class StateManager {
  private state: AppState;
  private listeners: Map<string, ((state: AppState) => void)[]> = new Map();

  constructor() {
    this.state = {
      currentUser: null,
      currentPage: 'home',
      isLoading: false,
      theme: 'light',
      language: 'ar',
    };
  }

  async init(): Promise<void> {
    // Load state from localStorage
    const savedState = localStorage.getItem('scout-app-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        this.state = { ...this.state, ...parsed };
      } catch (error) {
        console.warn('Failed to parse saved state:', error);
      }
    }
  }

  getState(): AppState {
    return { ...this.state };
  }

  setState(updates: Partial<AppState>): void {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    // Save to localStorage
    this.saveState();
    
    // Notify listeners
    this.notifyListeners(prevState);
  }

  subscribe(event: string, callback: (state: AppState) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  setCurrentUser(user: User | null): void {
    this.setState({ currentUser: user });
  }

  setCurrentPage(page: string): void {
    this.setState({ currentPage: page });
  }

  setLoading(isLoading: boolean): void {
    this.setState({ isLoading });
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.setState({ theme });
    document.documentElement.setAttribute('data-theme', theme);
  }

  setLanguage(language: 'ar' | 'en'): void {
    this.setState({ language });
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  }

  private saveState(): void {
    try {
      const stateToSave = {
        theme: this.state.theme,
        language: this.state.language,
      };
      localStorage.setItem('scout-app-state', JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save state:', error);
    }
  }

  private notifyListeners(prevState: AppState): void {
    // Notify all listeners
    this.listeners.forEach((callbacks) => {
      callbacks.forEach((callback) => {
        try {
          callback(this.state);
        } catch (error) {
          console.error('Error in state listener:', error);
        }
      });
    });
  }
}