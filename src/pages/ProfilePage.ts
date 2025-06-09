import { BaseComponent } from '../components/BaseComponent';
import { StateManager } from '../core/StateManager';
import { UIManager } from '../core/UIManager';

export class ProfilePage extends BaseComponent {
  private uiManager: UIManager;

  constructor(stateManager: StateManager) {
    super(stateManager);
    this.uiManager = new UIManager(stateManager);
  }

  render(): string {
    const state = this.stateManager.getState();
    const user = state.currentUser;

    return `
      <div class="app-layout">
        ${this.renderHeader()}
        
        <main class="main-content">
          <div class="page-content">
            ${this.renderProfileHeader(user)}
            ${this.renderProfileSections(user)}
          </div>
        </main>

        ${this.renderBottomNav()}
      </div>
    `;
  }

  private renderHeader(): string {
    return `
      <header class="app-header">
        <div class="header-content">
          <div class="header-title">
            <button class="back-btn" onclick="history.back()">
              <i data-lucide="arrow-right"></i>
            </button>
            <h1>الملف الشخصي</h1>
          </div>
          
          <div class="header-actions">
            <button class="edit-profile-btn" id="editProfileBtn">
              <i data-lucide="edit"></i>
            </button>
            <button class="settings-btn" id="settingsBtn">
              <i data-lucide="settings"></i>
            </button>
          </div>
        </div>
      </header>
    `;
  }

  private renderProfileHeader(user: any): string {
    return `
      <div class="profile-header">
        <div class="profile-cover">
          <img src="https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg" alt="صورة الغلاف" />
        </div>
        
        <div class="profile-info">
          <div class="profile-avatar-section">
            <div class="profile-avatar-large">
              <img src="${user?.avatarUrl || '/images/default-avatar.png'}" alt="صورة الملف الشخصي" />
              <button class="change-avatar-btn" id="changeAvatarBtn">
                <i data-lucide="camera"></i>
              </button>
            </div>
          </div>
          
          <div class="profile-details">
            <h2>${user?.fullName || 'اسم المستخدم'}</h2>
            <p class="profile-role">${this.getRoleDisplayName(user?.role || 'member')}</p>
            <p class="profile-bio">${user?.bio || 'عضو نشط في كشافة تموز'}</p>
            
            <div class="profile-stats">
              <div class="stat">
                <span class="stat-number">12</span>
                <span class="stat-label">شارة</span>
              </div>
              <div class="stat">
                <span class="stat-number">3</span>
                <span class="stat-label">سنوات</span>
              </div>
              <div class="stat">
                <span class="stat-number">45</span>
                <span class="stat-label">نشاط</span>
              </div>
              <div class="stat">
                <span class="stat-number">156</span>
                <span class="stat-label">نقطة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderProfileSections(user: any): string {
    return `
      <div class="profile-sections">
        ${this.renderPersonalInfoSection(user)}
        ${this.renderBadgesSection()}
        ${this.renderSkillsSection()}
        ${this.renderActivitiesSection()}
        ${this.renderAchievementsSection()}
      </div>
    `;
  }

  private renderPersonalInfoSection(user: any): string {
    return `
      <div class="profile-section">
        <div class="section-header">
          <h3>المعلومات الشخصية</h3>
          <button class="section-action" id="editInfoBtn">
            <i data-lucide="edit"></i>
            تعديل
          </button>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <div class="info-icon">
              <i data-lucide="mail"></i>
            </div>
            <div class="info-content">
              <label>البريد الإلكتروني</label>
              <span>${user?.email || 'user@example.com'}</span>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-icon">
              <i data-lucide="phone"></i>
            </div>
            <div class="info-content">
              <label>رقم الهاتف</label>
              <span>${user?.phone || '+961 70 123 456'}</span>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-icon">
              <i data-lucide="calendar"></i>
            </div>
            <div class="info-content">
              <label>تاريخ الانضمام</label>
              <span>${this.formatDate(user?.joinDate || '2022-01-01')}</span>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-icon">
              <i data-lucide="map-pin"></i>
            </div>
            <div class="info-content">
              <label>الموقع</label>
              <span>بيروت، لبنان</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderBadgesSection(): string {
    const badges = [
      { id: '1', name: 'خبير التخييم', icon: '🏕️', earned: true, date: '2024-01-15' },
      { id: '2', name: 'ملاح ماهر', icon: '🧭', earned: true, date: '2024-02-20' },
      { id: '3', name: 'مسعف أولي', icon: '🏥', earned: true, date: '2024-03-10' },
      { id: '4', name: 'خبير النار', icon: '🔥', earned: false, progress: 75 },
      { id: '5', name: 'قائد المجموعة', icon: '👑', earned: false, progress: 30 },
      { id: '6', name: 'حامي البيئة', icon: '🌱', earned: false, progress: 0 },
    ];

    return `
      <div class="profile-section">
        <div class="section-header">
          <h3>الشارات والإنجازات</h3>
          <span class="section-count">${badges.filter(b => b.earned).length}/${badges.length}</span>
        </div>
        
        <div class="badges-grid">
          ${badges.map(badge => `
            <div class="badge-item ${badge.earned ? 'earned' : 'in-progress'}" data-badge-id="${badge.id}">
              <div class="badge-icon">
                ${badge.icon}
              </div>
              <div class="badge-info">
                <h4>${badge.name}</h4>
                ${badge.earned ? `
                  <span class="badge-date">حصل عليها في ${this.formatDate(badge.date!)}</span>
                ` : `
                  <div class="badge-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: ${badge.progress}%"></div>
                    </div>
                    <span class="progress-text">${badge.progress}%</span>
                  </div>
                `}
              </div>
              ${badge.earned ? `
                <div class="badge-status earned">
                  <i data-lucide="check-circle"></i>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderSkillsSection(): string {
    const skills = [
      { name: 'العقد', progress: 85, category: 'knots' },
      { name: 'التخييم', progress: 92, category: 'survival' },
      { name: 'التوجه', progress: 78, category: 'navigation' },
      { name: 'الإسعافات الأولية', progress: 65, category: 'first-aid' },
      { name: 'القيادة', progress: 45, category: 'leadership' },
    ];

    return `
      <div class="profile-section">
        <div class="section-header">
          <h3>المهارات المكتسبة</h3>
          <button class="section-action" onclick="window.location.hash='skills'">
            <i data-lucide="external-link"></i>
            عرض الكل
          </button>
        </div>
        
        <div class="skills-list">
          ${skills.map(skill => `
            <div class="skill-item">
              <div class="skill-info">
                <div class="skill-icon">
                  <i data-lucide="${this.getSkillIcon(skill.category)}"></i>
                </div>
                <div class="skill-details">
                  <h4>${skill.name}</h4>
                  <span class="skill-level">${this.getSkillLevel(skill.progress)}</span>
                </div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${skill.progress}%"></div>
                </div>
                <span class="progress-text">${skill.progress}%</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderActivitiesSection(): string {
    const activities = [
      { id: '1', title: 'رحلة تخييم جبال الشوف', date: '2024-01-15', status: 'completed', type: 'camping' },
      { id: '2', title: 'ورشة الإسعافات الأولية', date: '2024-01-10', status: 'completed', type: 'workshop' },
      { id: '3', title: 'اجتماع شهري للقادة', date: '2024-01-05', status: 'completed', type: 'meeting' },
    ];

    return `
      <div class="profile-section">
        <div class="section-header">
          <h3>الأنشطة الأخيرة</h3>
          <button class="section-action" onclick="window.location.hash='activities'">
            <i data-lucide="external-link"></i>
            عرض الكل
          </button>
        </div>
        
        <div class="activities-list">
          ${activities.map(activity => `
            <div class="activity-item">
              <div class="activity-icon ${activity.type}">
                <i data-lucide="${this.getActivityIcon(activity.type)}"></i>
              </div>
              <div class="activity-details">
                <h4>${activity.title}</h4>
                <p>${this.formatDate(activity.date)}</p>
                <span class="activity-status ${activity.status}">
                  ${this.getStatusDisplayName(activity.status)}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderAchievementsSection(): string {
    const achievements = [
      { id: '1', title: 'أول مشاركة', description: 'شارك في أول نشاط كشفي', icon: 'star', date: '2022-01-15' },
      { id: '2', title: 'مخيم ناجح', description: 'أكمل 5 رحلات تخييم', icon: 'tent', date: '2023-06-20' },
      { id: '3', title: 'مساعد موثوق', description: 'ساعد في تنظيم 10 أنشطة', icon: 'heart', date: '2023-12-10' },
    ];

    return `
      <div class="profile-section">
        <div class="section-header">
          <h3>الإنجازات الخاصة</h3>
          <span class="section-count">${achievements.length}</span>
        </div>
        
        <div class="achievements-list">
          ${achievements.map(achievement => `
            <div class="achievement-item">
              <div class="achievement-icon">
                <i data-lucide="${achievement.icon}"></i>
              </div>
              <div class="achievement-content">
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
                <span class="achievement-date">${this.formatDate(achievement.date)}</span>
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
        <a href="#home" class="nav-item" data-page="home">
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
        <a href="#profile" class="nav-item active" data-page="profile">
          <i data-lucide="user"></i>
          <span>الملف</span>
        </a>
      </nav>
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

    // Change avatar
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    changeAvatarBtn?.addEventListener('click', () => this.handleChangeAvatar());

    // Edit profile
    const editProfileBtn = document.getElementById('editProfileBtn');
    editProfileBtn?.addEventListener('click', () => this.handleEditProfile());

    // Edit info
    const editInfoBtn = document.getElementById('editInfoBtn');
    editInfoBtn?.addEventListener('click', () => this.handleEditInfo());

    // Settings
    const settingsBtn = document.getElementById('settingsBtn');
    settingsBtn?.addEventListener('click', () => this.handleSettings());

    // Badge clicks
    document.querySelectorAll('.badge-item').forEach(badge => {
      badge.addEventListener('click', () => {
        const badgeId = (badge as HTMLElement).dataset.badgeId;
        this.handleBadgeClick(badgeId!);
      });
    });
  }

  private handleChangeAvatar(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const avatarImg = document.querySelector('.profile-avatar-large img') as HTMLImageElement;
          if (avatarImg && e.target?.result) {
            avatarImg.src = e.target.result as string;
            this.uiManager.showToast('تم تحديث الصورة الشخصية!', { type: 'success' });
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  private handleEditProfile(): void {
    const state = this.stateManager.getState();
    const user = state.currentUser;

    this.uiManager.showModal({
      title: 'تعديل الملف الشخصي',
      content: `
        <div class="edit-profile-form">
          <div class="form-group">
            <label for="editFullName">الاسم الكامل</label>
            <input type="text" id="editFullName" value="${user?.fullName || ''}" />
          </div>
          <div class="form-group">
            <label for="editBio">النبذة الشخصية</label>
            <textarea id="editBio" rows="3">${user?.bio || ''}</textarea>
          </div>
          <div class="form-group">
            <label for="editPhone">رقم الهاتف</label>
            <input type="tel" id="editPhone" value="${user?.phone || ''}" />
          </div>
          <div class="form-actions">
            <button class="btn btn-secondary">إلغاء</button>
            <button class="btn btn-primary">حفظ التغييرات</button>
          </div>
        </div>
      `,
      type: 'custom'
    });
  }

  private handleEditInfo(): void {
    this.uiManager.showToast('تعديل المعلومات الشخصية قيد التطوير', { type: 'info' });
  }

  private handleSettings(): void {
    this.uiManager.showModal({
      title: 'الإعدادات',
      content: `
        <div class="settings-menu">
          <div class="settings-section">
            <h4>الحساب</h4>
            <button class="settings-item">
              <i data-lucide="user"></i>
              <span>إعدادات الحساب</span>
              <i data-lucide="chevron-left"></i>
            </button>
            <button class="settings-item">
              <i data-lucide="shield"></i>
              <span>الخصوصية والأمان</span>
              <i data-lucide="chevron-left"></i>
            </button>
          </div>
          
          <div class="settings-section">
            <h4>التطبيق</h4>
            <button class="settings-item">
              <i data-lucide="bell"></i>
              <span>الإشعارات</span>
              <i data-lucide="chevron-left"></i>
            </button>
            <button class="settings-item" id="themeToggle">
              <i data-lucide="moon"></i>
              <span>الوضع المظلم</span>
              <div class="toggle-switch">
                <input type="checkbox" />
                <span class="slider"></span>
              </div>
            </button>
            <button class="settings-item">
              <i data-lucide="globe"></i>
              <span>اللغة</span>
              <i data-lucide="chevron-left"></i>
            </button>
          </div>
          
          <div class="settings-section">
            <h4>المساعدة</h4>
            <button class="settings-item">
              <i data-lucide="help-circle"></i>
              <span>مركز المساعدة</span>
              <i data-lucide="chevron-left"></i>
            </button>
            <button class="settings-item">
              <i data-lucide="message-circle"></i>
              <span>تواصل معنا</span>
              <i data-lucide="chevron-left"></i>
            </button>
            <button class="settings-item">
              <i data-lucide="info"></i>
              <span>حول التطبيق</span>
              <i data-lucide="chevron-left"></i>
            </button>
          </div>
        </div>
      `,
      type: 'custom'
    });
  }

  private handleBadgeClick(badgeId: string): void {
    this.uiManager.showToast(`تفاصيل الشارة رقم ${badgeId} قيد التطوير`, { type: 'info' });
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

  private getSkillIcon(category: string): string {
    const icons: Record<string, string> = {
      'knots': 'link',
      'survival': 'flame',
      'navigation': 'compass',
      'first-aid': 'heart-pulse',
      'leadership': 'crown'
    };
    return icons[category] || 'compass';
  }

  private getSkillLevel(progress: number): string {
    if (progress >= 90) return 'خبير';
    if (progress >= 70) return 'متقدم';
    if (progress >= 50) return 'متوسط';
    if (progress >= 30) return 'مبتدئ';
    return 'جديد';
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
}