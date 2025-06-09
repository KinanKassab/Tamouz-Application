import { StateManager } from './StateManager';
import { User } from '../types';
import { MockDataService } from '../services/MockDataService';

export class AuthManager {
  private stateManager: StateManager;
  private mockDataService: MockDataService;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
    this.mockDataService = new MockDataService();
  }

  async checkAuthStatus(): Promise<boolean> {
    // For now, check localStorage for demo user
    const savedUser = localStorage.getItem('scout-app-user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.stateManager.setCurrentUser(user);
        return true;
      } catch (error) {
        console.warn('Failed to parse saved user:', error);
        localStorage.removeItem('scout-app-user');
      }
    }
    return false;
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock authentication - replace with real Supabase integration later
      if (email && password.length >= 6) {
        const user = this.mockDataService.createMockUser(email);
        this.stateManager.setCurrentUser(user);
        localStorage.setItem('scout-app-user', JSON.stringify(user));
        return { success: true };
      } else {
        return { success: false, error: 'بيانات الدخول غير صحيحة' };
      }
    } catch (error) {
      return { success: false, error: 'حدث خطأ في تسجيل الدخول' };
    }
  }

  async register(userData: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock registration - replace with real Supabase integration later
      if (userData.fullName && userData.email && userData.password.length >= 6) {
        const user = this.mockDataService.createMockUser(userData.email, userData.fullName);
        this.stateManager.setCurrentUser(user);
        localStorage.setItem('scout-app-user', JSON.stringify(user));
        return { success: true };
      } else {
        return { success: false, error: 'يرجى ملء جميع الحقول بشكل صحيح' };
      }
    } catch (error) {
      return { success: false, error: 'حدث خطأ في إنشاء الحساب' };
    }
  }

  async logout(): Promise<void> {
    this.stateManager.setCurrentUser(null);
    localStorage.removeItem('scout-app-user');
  }

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock password reset - replace with real Supabase integration later
      if (email) {
        return { success: true };
      } else {
        return { success: false, error: 'يرجى إدخال بريد إلكتروني صحيح' };
      }
    } catch (error) {
      return { success: false, error: 'حدث خطأ في إرسال رابط إعادة التعيين' };
    }
  }
}