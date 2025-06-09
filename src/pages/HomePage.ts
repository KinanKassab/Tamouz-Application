import { BaseComponent } from '../components/BaseComponent';
import { StateManager } from '../core/StateManager';
import { MockDataService } from '../services/MockDataService';
import { UIManager } from '../core/UIManager';

export class HomePage extends BaseComponent {
  private mockDataService: MockDataService;
  private uiManager: UIManager;

  constructor(stateManager: StateManager) {
    super(stateManager);
    this.mockDataService = new MockDataService();
    this.uiManager = new UIManager(stateManager);
  }

  render(): string {
    const state = this.stateManager.getState();
    const activities = this.mockDataService.getMockActivities().slice(0, 2);

    return `
      <div class="app-layout">
        ${this.renderHeader()}
        
        <main class="main-content">
          <div class="page-content">
            ${this.renderWelcomeSection()}
            ${this.renderStatsGrid()}
            ${this.renderQuickActions()}
            ${this.renderRecentActivities(activities)}
          </div>
        </main>

        ${this.renderBottomNav()}
        ${this.renderSideMenu()}
        ${this.renderNotificationsPanel()}
      </div>
    `;
  }

  private renderHeader(): string {
    const state = this.stateManager.getState();
    const user = state.currentUser;

    return `
      <header class="app-header">
        <div class="header-content">
          <div class="user-profile">
            <div class="profile-avatar">
              <img src="${user?.avatarUrl || '/images/default-avatar.png'}" alt="صورة المستخدم" />
            </div>
            <div class="profile-info">
              <h3>مرحباً، ${user?.fullName || 'مستخدم'}</h3>
              <span class="user-role">${this.getRoleDisplayName(user?.role || 'member')}</span>
            </div>
          </div>
          
          <div class="header-actions">
            <button class="notification-btn" id="notificationBtn">
              <i data-lucide="bell"></i>
              <span class="notification-badge">3</span>
            </button>
            <button class="theme-toggle" id="themeToggle">
              <i data-lucide="sun"></i>
            </button>
            <button class="menu-btn" id="menuBtn">
              <i data-lucide="menu"></i>
            </button>
          </div>
        </div>
      </header>
    `;
  }

  private renderWelcomeSection(): string {
    return `
      <div class="welcome-section">
        <div class="welcome-card">
          <div class="welcome-icon">
            <i data-lucide="tent"></i>
          </div>
          <h2>مرحباً بك في كشافة تموز</h2>
          <p>استعد لمغامرات جديدة ومهارات مفيدة!</p>
        </div>
      </div>
    `;
  }

  private renderStatsGrid(): string {
    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i data-lucide="award"></i>
          </div>
          <div class="stat-info">
            <span class="stat-number">12</span>
            <span class="stat-label">الشارات المكتسبة</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i data-lucide="calendar-days"></i>
          </div>
          <div class="stat-info">
            <span class="stat-number">3</span>
            <span class="stat-label">الأنشطة القادمة</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i data-lucide="trending-up"></i>
          </div>
          <div class="stat-info">
            <span class="stat-number">85%</span>
            <span class="stat-label">مستوى التقدم</span>
          </div>
        </div>
      </div>
    `;
  }

  private renderQuickActions(): string {
    return `
      <div class="quick-actions">
        <h3>إجراءات سريعة</h3>
        <div class="actions-grid">
          <button class="action-card" data-action="attendance">
            <i data-lucide="check-circle"></i>
            <span>تسجيل الحضور</span>
          </button>
          <button class="action-card" data-action="badges">
            <i data-lucide="award"></i>
            <span>الشارات</span>
          </button>
          <button class="action-card" data-action="gallery">
            <i data-lucide="camera"></i>
            <span>معرض الصور</span>
          </button>
          <button class="action-card" data-action="messages">
            <i data-lucide="message-circle"></i>
            <span>الرسائل</span>
          </button>
        </div>
      </div>
    `;
  }

  private renderRecentActivities(activities: any[]): string {
    return `
      <div class="recent-activities">
        <h3>الأنشطة الحديثة</h3>
        <div class="activity-list">
          ${activities.map(activity => `
            <div class="activity-item">
              <div class="activity-icon ${activity.type}">
                <i data-lucide="${this.getActivityIcon(activity.type)}"></i>
              </div>
              <div class="activity-info">
                <h4>${activity.title}</h4>
                <p>${this.formatDate(activity.date)} - ${activity.description}</p>
                <span class="activity-status ${activity.status}">${this.getStatusDisplayName(activity.status)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderBottomNav(): string {
    return `
      <nav class="bottom-nav">
        <a href="#home" class="nav-item active" data-page="home">
          <i data-lucide="home"></i>
          <span>الرئيسية</span>
        </a>
        <a href="#activities" class="nav-item" data-page="activities">
          <i data-lucide="calendar"></i>
          <span>الأنشطة</span>
        </a>
        <a href="#skills" class="nav-item" data-page="skills">
          <i data-lucide="compass"></i>
          <span>المهارات</span>
        </a>
        <a href="#community" class="nav-item" data-page="community">
          <i data-lucide="users"></i>
          <span>المجتمع</span>
        </a>
        <a href="#profile" class="nav-item" data-page="profile">
          <i data-lucide="user"></i>
          <span>الملف</span>
        </a>
      </nav>
    `;
  }

  private renderSideMenu(): string {
    const state = this.stateManager.getState();
    const user = state.currentUser;

    return `
      <div id="side-menu" class="side-menu">
        <div class="menu-header">
          <div class="menu-user-info">
            <div class="menu-avatar">
              <img src="${user?.avatarUrl || '/images/default-avatar.png'}" alt="صورة المستخدم" />
            </div>
            <div class="menu-user-details">
              <h4>${user?.fullName || 'اسم المستخدم'}</h4>
              <p>${user?.email || 'user@example.com'}</p>
            </div>
          </div>
          <button class="close-menu" id="closeMenu">
            <i data-lucide="x"></i>
          </button>
        </div>
        
        <div class="menu-content">
          <div class="menu-section">
            <h5>التطبيق</h5>
            <a href="#settings" class="menu-item">
              <i data-lucide="settings"></i>
              <span>الإعدادات</span>
            </a>
            <a href="#help" class="menu-item">
              <i data-lucide="help-circle"></i>
              <span>المساعدة</span>
            </a>
            <a href="#about" class="menu-item">
              <i data-lucide="info"></i>
              <span>حول التطبيق</span>
            </a>
          </div>
          
          <div class="menu-section">
            <h5>الحساب</h5>
            <button class="menu-item logout-btn" id="logoutBtn">
              <i data-lucide="log-out"></i>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private renderNotificationsPanel(): string {
    const notifications = this.mockDataService.getMockNotifications();

    return `
      <div id="notifications-panel" class="notifications-panel">
        <div class="panel-header">
          <h3>الإشعارات</h3>
          <button class="close-panel" id="closeNotifications">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="notifications-list">
          ${notifications.map(notification => `
            <div class="notification-item ${notification.isRead ? 'read' : 'unread'}">
              <div class="notification-icon ${notification.type}">
                <i data-lucide="${this.getNotificationIcon(notification.type)}"></i>
              </div>
              <div class="notification-content">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
                <span class="notification-time">${this.formatRelativeTime(notification.createdAt)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  init(): void {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = (item as HTMLElement).dataset.page;
        if (page) {
          window.location.hash = page;
        }
      });
    });

    // Menu toggle
    const menuBtn = document.getElementById('menuBtn');
    menuBtn?.addEventListener('click', () => this.toggleSideMenu());

    const closeMenu = document.getElementById('closeMenu');
    closeMenu?.addEventListener('click', () => this.closeSideMenu());

    // Notifications toggle
    const notificationBtn = document.getElementById('notificationBtn');
    notificationBtn?.addEventListener('click', () => this.toggleNotifications());

    const closeNotifications = document.getElementById('closeNotifications');
    closeNotifications?.addEventListener('click', () => this.closeNotifications());

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    themeToggle?.addEventListener('click', () => this.toggleTheme());

    // Overlay
    const overlay = document.getElementById('overlay');
    overlay?.addEventListener('click', () => this.closeAllPanels());

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', () => this.handleLogout());

    // Quick actions
    document.querySelectorAll('.action-card').forEach(card => {
      card.addEventListener('click', () => {
        const action = (card as HTMLElement).dataset.action;
        this.handleQuickAction(action!);
      });
    });
  }

  private toggleSideMenu(): void {
    const sideMenu = document.getElementById('side-menu');
    const overlay = document.getElementById('overlay');
    
    sideMenu?.classList.add('active');
    overlay?.classList.add('active');
  }

  private closeSideMenu(): void {
    const sideMenu = document.getElementById('side-menu');
    const overlay = document.getElementById('overlay');
    
    sideMenu?.classList.remove('active');
    overlay?.classList.remove('active');
  }

  private toggleNotifications(): void {
    const panel = document.getElementById('notifications-panel');
    const overlay = document.getElementById('overlay');
    
    panel?.classList.add('active');
    overlay?.classList.add('active');
  }

  private closeNotifications(): void {
    const panel = document.getElementById('notifications-panel');
    const overlay = document.getElementById('overlay');
    
    panel?.classList.remove('active');
    overlay?.classList.remove('active');
  }

  private toggleTheme(): void {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    this.stateManager.setTheme(newTheme);
    
    // Update icon
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle?.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', newTheme === 'light' ? 'sun' : 'moon');
    }
  }

  private closeAllPanels(): void {
    this.closeSideMenu();
    this.closeNotifications();
  }

  private async handleLogout(): Promise<void> {
    this.uiManager.showModal({
      title: 'تأكيد تسجيل الخروج',
      content: 'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
      type: 'confirm',
      onConfirm: async () => {
        const authManager = new (await import('../core/AuthManager')).AuthManager(this.stateManager);
        await authManager.logout();
        window.location.hash = 'auth';
        this.uiManager.showToast('تم تسجيل الخروج بنجاح', { type: 'success' });
      }
    });
  }

  private handleQuickAction(action: string): void {
    switch (action) {
      case 'attendance':
        this.uiManager.showToast('تم تسجيل حضورك بنجاح!', { type: 'success' });
        break;
      case 'badges':
        window.location.hash = 'profile';
        break;
      case 'gallery':
        this.uiManager.showToast('معرض الصور قيد التطوير', { type: 'info' });
        break;
      case 'messages':
        this.uiManager.showToast('نظام الرسائل قيد التطوير', { type: 'info' });
        break;
    }
  }

  private getRoleDisplayName(role: string): string {
    const roleNames: Record<string, string> = {
      'guest': 'ضيف',
      'member': 'عضو',
      'leader': 'قائد',
      'admin': 'مدير'
    };
    return roleNames[role] || 'عضو';
  }

  private getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      'camping': 'tent',
      'workshop': 'heart-pulse',
      'meeting': 'users',
      'training': 'dumbbell',
      'community': 'heart',
      'outdoor': 'mountain'
    };
    return icons[type] || 'calendar';
  }

  private getStatusDisplayName(status: string): string {
    const statusNames: Record<string, string> = {
      'upcoming': 'قادم',
      'ongoing': 'جاري',
      'completed': 'مكتمل',
      'cancelled': 'ملغي'
    };
    return statusNames[status] || status;
  }

  private getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      'info': 'info',
      'success': 'check-circle',
      'warning': 'alert-triangle',
      'error': 'alert-circle'
    };
    return icons[type] || 'bell';
  }
}