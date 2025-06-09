import { BaseComponent } from '../components/BaseComponent';
import { StateManager } from '../core/StateManager';
import { AuthManager } from '../core/AuthManager';
import { UIManager } from '../core/UIManager';

export class AuthPage extends BaseComponent {
  private authManager: AuthManager;
  private uiManager: UIManager;

  constructor(stateManager: StateManager) {
    super(stateManager);
    this.authManager = new AuthManager(stateManager);
    this.uiManager = new UIManager(stateManager);
  }

  render(): string {
    return `
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-logo">
              <img src="/Logo.png" alt="شعار كشافة تموز" />
            </div>
            <h1>كشافة تموز</h1>
            <p>انضم إلى مجتمع الكشافة الأول</p>
          </div>
          
          <div class="auth-tabs">
            <button class="auth-tab active" data-tab="login">تسجيل الدخول</button>
            <button class="auth-tab" data-tab="register">إنشاء حساب</button>
          </div>
          
          <div class="auth-forms">
            <!-- Login Form -->
            <form id="loginForm" class="auth-form active">
              <div class="form-group">
                <label for="loginEmail">البريد الإلكتروني</label>
                <div class="input-wrapper">
                  <i data-lucide="mail"></i>
                  <input type="email" id="loginEmail" required placeholder="أدخل بريدك الإلكتروني" />
                </div>
              </div>
              <div class="form-group">
                <label for="loginPassword">كلمة المرور</label>
                <div class="input-wrapper">
                  <i data-lucide="lock"></i>
                  <input type="password" id="loginPassword" required placeholder="أدخل كلمة المرور" />
                  <button type="button" class="toggle-password" data-target="loginPassword">
                    <i data-lucide="eye"></i>
                  </button>
                </div>
              </div>
              <button type="submit" class="auth-btn primary">
                <span>تسجيل الدخول</span>
                <i data-lucide="arrow-left"></i>
              </button>
              <button type="button" class="auth-btn secondary" id="forgotPasswordBtn">
                نسيت كلمة المرور؟
              </button>
            </form>
            
            <!-- Register Form -->
            <form id="registerForm" class="auth-form">
              <div class="form-group">
                <label for="registerName">الاسم الكامل</label>
                <div class="input-wrapper">
                  <i data-lucide="user"></i>
                  <input type="text" id="registerName" required placeholder="أدخل اسمك الكامل" />
                </div>
              </div>
              <div class="form-group">
                <label for="registerEmail">البريد الإلكتروني</label>
                <div class="input-wrapper">
                  <i data-lucide="mail"></i>
                  <input type="email" id="registerEmail" required placeholder="أدخل بريدك الإلكتروني" />
                </div>
              </div>
              <div class="form-group">
                <label for="registerPassword">كلمة المرور</label>
                <div class="input-wrapper">
                  <i data-lucide="lock"></i>
                  <input type="password" id="registerPassword" required minlength="6" placeholder="أدخل كلمة المرور" />
                  <button type="button" class="toggle-password" data-target="registerPassword">
                    <i data-lucide="eye"></i>
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label for="registerConfirmPassword">تأكيد كلمة المرور</label>
                <div class="input-wrapper">
                  <i data-lucide="lock"></i>
                  <input type="password" id="registerConfirmPassword" required placeholder="أعد إدخال كلمة المرور" />
                </div>
              </div>
              <button type="submit" class="auth-btn primary">
                <span>إنشاء حساب</span>
                <i data-lucide="user-plus"></i>
              </button>
            </form>
          </div>
          
          <div class="auth-footer">
            <p>بالمتابعة، أنت توافق على <a href="#terms">شروط الاستخدام</a> و <a href="#privacy">سياسة الخصوصية</a></p>
          </div>
        </div>
      </div>
    `;
  }

  init(): void {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = (tab as HTMLElement).dataset.tab;
        this.switchTab(tabName!);
      });
    });

    // Password toggle
    document.querySelectorAll('.toggle-password').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = (btn as HTMLElement).dataset.target;
        this.togglePassword(targetId!);
      });
    });

    // Login form
    const loginForm = document.getElementById('loginForm') as HTMLFormElement;
    loginForm?.addEventListener('submit', (e) => this.handleLogin(e));

    // Register form
    const registerForm = document.getElementById('registerForm') as HTMLFormElement;
    registerForm?.addEventListener('submit', (e) => this.handleRegister(e));

    // Forgot password
    const forgotBtn = document.getElementById('forgotPasswordBtn');
    forgotBtn?.addEventListener('click', () => this.handleForgotPassword());
  }

  private switchTab(tabName: string): void {
    // Update active tab
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    
    // Update active form
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.getElementById(tabName + 'Form')?.classList.add('active');
  }

  private togglePassword(targetId: string): void {
    const input = document.getElementById(targetId) as HTMLInputElement;
    const button = document.querySelector(`[data-target="${targetId}"]`);
    const icon = button?.querySelector('i');
    
    if (input && icon) {
      if (input.type === 'password') {
        input.type = 'text';
        icon.setAttribute('data-lucide', 'eye-off');
      } else {
        input.type = 'password';
        icon.setAttribute('data-lucide', 'eye');
      }
    }
  }

  private async handleLogin(e: Event): Promise<void> {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = (document.getElementById('loginEmail') as HTMLInputElement).value;
    const password = (document.getElementById('loginPassword') as HTMLInputElement).value;
    
    try {
      this.stateManager.setLoading(true);
      
      const result = await this.authManager.login(email, password);
      
      if (result.success) {
        this.uiManager.showToast('تم تسجيل الدخول بنجاح!', { type: 'success' });
        // Navigate to main app - this will be handled by the router
        window.location.hash = 'home';
      } else {
        this.uiManager.showToast(result.error || 'حدث خطأ في تسجيل الدخول', { type: 'error' });
      }
    } catch (error) {
      this.uiManager.showToast('حدث خطأ غير متوقع', { type: 'error' });
    } finally {
      this.stateManager.setLoading(false);
    }
  }

  private async handleRegister(e: Event): Promise<void> {
    e.preventDefault();
    
    const fullName = (document.getElementById('registerName') as HTMLInputElement).value;
    const email = (document.getElementById('registerEmail') as HTMLInputElement).value;
    const password = (document.getElementById('registerPassword') as HTMLInputElement).value;
    const confirmPassword = (document.getElementById('registerConfirmPassword') as HTMLInputElement).value;
    
    if (password !== confirmPassword) {
      this.uiManager.showToast('كلمات المرور غير متطابقة', { type: 'error' });
      return;
    }
    
    try {
      this.stateManager.setLoading(true);
      
      const result = await this.authManager.register({ fullName, email, password });
      
      if (result.success) {
        this.uiManager.showToast('تم إنشاء الحساب بنجاح!', { type: 'success' });
        // Navigate to main app
        window.location.hash = 'home';
      } else {
        this.uiManager.showToast(result.error || 'حدث خطأ في إنشاء الحساب', { type: 'error' });
      }
    } catch (error) {
      this.uiManager.showToast('حدث خطأ غير متوقع', { type: 'error' });
    } finally {
      this.stateManager.setLoading(false);
    }
  }

  private async handleForgotPassword(): Promise<void> {
    const email = prompt('أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور:');
    
    if (email) {
      try {
        const result = await this.authManager.resetPassword(email);
        
        if (result.success) {
          this.uiManager.showToast('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني', { type: 'success' });
        } else {
          this.uiManager.showToast(result.error || 'حدث خطأ في إرسال البريد الإلكتروني', { type: 'error' });
        }
      } catch (error) {
        this.uiManager.showToast('حدث خطأ غير متوقع', { type: 'error' });
      }
    }
  }
}