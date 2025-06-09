import { BaseComponent } from '../components/BaseComponent';
import { StateManager } from '../core/StateManager';
import { MockDataService } from '../services/MockDataService';
import { UIManager } from '../core/UIManager';
import { Activity } from '../types';

export class ActivitiesPage extends BaseComponent {
  private mockDataService: MockDataService;
  private uiManager: UIManager;
  private activities: Activity[] = [];
  private currentFilter = 'all';

  constructor(stateManager: StateManager) {
    super(stateManager);
    this.mockDataService = new MockDataService();
    this.uiManager = new UIManager(stateManager);
    this.activities = this.mockDataService.getMockActivities();
  }

  render(): string {
    return `
      <div class="app-layout">
        ${this.renderHeader()}
        
        <main class="main-content">
          <div class="page-content">
            ${this.renderPageHeader()}
            ${this.renderFilterTabs()}
            ${this.renderActivitiesGrid()}
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
            <h1>الأنشطة والفعاليات</h1>
          </div>
          
          <div class="header-actions">
            <button class="search-btn" id="searchBtn">
              <i data-lucide="search"></i>
            </button>
            <button class="filter-btn" id="filterBtn">
              <i data-lucide="filter"></i>
            </button>
          </div>
        </div>
      </header>
    `;
  }

  private renderPageHeader(): string {
    return `
      <div class="page-header">
        <div class="page-title">
          <h2>الأنشطة والفعاليات</h2>
          <p>اكتشف الأنشطة القادمة وسجل مشاركتك</p>
        </div>
        <button class="header-btn" id="addActivityBtn">
          <i data-lucide="plus"></i>
          إضافة نشاط
        </button>
      </div>
    `;
  }

  private renderFilterTabs(): string {
    const filters = [
      { key: 'all', label: 'الكل' },
      { key: 'upcoming', label: 'القادمة' },
      { key: 'registered', label: 'مسجل بها' },
      { key: 'completed', label: 'مكتملة' }
    ];

    return `
      <div class="filter-tabs">
        ${filters.map(filter => `
          <button class="filter-tab ${filter.key === this.currentFilter ? 'active' : ''}" 
                  data-filter="${filter.key}">
            ${filter.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  private renderActivitiesGrid(): string {
    const filteredActivities = this.getFilteredActivities();

    if (filteredActivities.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">
            <i data-lucide="calendar-x"></i>
          </div>
          <h3>لا توجد أنشطة</h3>
          <p>لم يتم العثور على أنشطة تطابق المرشح المحدد</p>
        </div>
      `;
    }

    return `
      <div class="activities-grid">
        ${filteredActivities.map(activity => this.renderActivityCard(activity)).join('')}
      </div>
    `;
  }

  private renderActivityCard(activity: Activity): string {
    const date = new Date(activity.date);
    const day = date.getDate();
    const month = date.toLocaleDateString('ar-SA', { month: 'long' });

    return `
      <div class="activity-card ${activity.type}" data-activity-id="${activity.id}">
        <div class="activity-header">
          <div class="activity-date">
            <span class="day">${day}</span>
            <span class="month">${month}</span>
          </div>
          <div class="activity-type">
            <i data-lucide="${this.getActivityIcon(activity.type)}"></i>
          </div>
        </div>
        
        ${activity.imageUrl ? `
          <div class="activity-image">
            <img src="${activity.imageUrl}" alt="${activity.title}" loading="lazy" />
          </div>
        ` : ''}
        
        <div class="activity-content">
          <h3>${activity.title}</h3>
          <p>${activity.description}</p>
          
          <div class="activity-meta">
            <span><i data-lucide="clock"></i> ${this.formatTime(activity.time)}</span>
            <span><i data-lucide="map-pin"></i> ${activity.location}</span>
            <span><i data-lucide="users"></i> ${activity.currentParticipants}/${activity.maxParticipants} مشارك</span>
          </div>
          
          <div class="activity-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${(activity.currentParticipants / activity.maxParticipants) * 100}%"></div>
            </div>
            <span class="progress-text">${Math.round((activity.currentParticipants / activity.maxParticipants) * 100)}% ممتلئ</span>
          </div>
        </div>
        
        <div class="activity-actions">
          <button class="btn btn-primary join-btn" data-activity-id="${activity.id}">
            <i data-lucide="user-plus"></i>
            انضمام
          </button>
          <button class="btn btn-secondary details-btn" data-activity-id="${activity.id}">
            <i data-lucide="info"></i>
            تفاصيل
          </button>
          <button class="btn btn-ghost share-btn" data-activity-id="${activity.id}">
            <i data-lucide="share-2"></i>
          </button>
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
        <a href="#activities" class="nav-item active" data-page="activities">
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

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = (tab as HTMLElement).dataset.filter;
        if (filter) {
          this.setFilter(filter);
        }
      });
    });

    // Activity actions
    document.querySelectorAll('.join-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const activityId = (btn as HTMLElement).dataset.activityId;
        this.handleJoinActivity(activityId!);
      });
    });

    document.querySelectorAll('.details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const activityId = (btn as HTMLElement).dataset.activityId;
        this.handleShowDetails(activityId!);
      });
    });

    document.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const activityId = (btn as HTMLElement).dataset.activityId;
        this.handleShareActivity(activityId!);
      });
    });

    // Add activity button
    const addBtn = document.getElementById('addActivityBtn');
    addBtn?.addEventListener('click', () => this.handleAddActivity());

    // Search and filter buttons
    const searchBtn = document.getElementById('searchBtn');
    searchBtn?.addEventListener('click', () => this.handleSearch());

    const filterBtn = document.getElementById('filterBtn');
    filterBtn?.addEventListener('click', () => this.handleAdvancedFilter());
  }

  private setFilter(filter: string): void {
    this.currentFilter = filter;
    
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.classList.remove('active');
      if ((tab as HTMLElement).dataset.filter === filter) {
        tab.classList.add('active');
      }
    });

    // Re-render activities grid
    const activitiesGrid = document.querySelector('.activities-grid');
    if (activitiesGrid) {
      activitiesGrid.innerHTML = this.renderActivitiesGrid().replace(/<div class="activities-grid">|<\/div>$/g, '');
    }
  }

  private getFilteredActivities(): Activity[] {
    switch (this.currentFilter) {
      case 'upcoming':
        return this.activities.filter(activity => activity.status === 'upcoming');
      case 'registered':
        // Mock: assume user is registered for first activity
        return this.activities.filter((_, index) => index === 0);
      case 'completed':
        return this.activities.filter(activity => activity.status === 'completed');
      default:
        return this.activities;
    }
  }

  private handleJoinActivity(activityId: string): void {
    const activity = this.activities.find(a => a.id === activityId);
    if (!activity) return;

    if (activity.currentParticipants >= activity.maxParticipants) {
      this.uiManager.showToast('النشاط ممتلئ بالكامل', { type: 'warning' });
      return;
    }

    this.uiManager.showModal({
      title: 'تأكيد الانضمام',
      content: `هل تريد الانضمام إلى نشاط "${activity.title}"؟`,
      type: 'confirm',
      onConfirm: () => {
        // Update activity participants
        activity.currentParticipants++;
        
        // Update button
        const btn = document.querySelector(`[data-activity-id="${activityId}"].join-btn`) as HTMLButtonElement;
        if (btn) {
          btn.innerHTML = '<i data-lucide="check"></i> مسجل';
          btn.className = 'btn btn-success';
          btn.disabled = true;
        }

        this.uiManager.showToast('تم التسجيل في النشاط بنجاح!', { type: 'success' });
      }
    });
  }

  private handleShowDetails(activityId: string): void {
    const activity = this.activities.find(a => a.id === activityId);
    if (!activity) return;

    const detailsContent = `
      <div class="activity-details">
        <div class="detail-section">
          <h4>الوصف</h4>
          <p>${activity.description}</p>
        </div>
        
        <div class="detail-section">
          <h4>التفاصيل</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">التاريخ:</span>
              <span class="value">${this.formatDate(activity.date)}</span>
            </div>
            <div class="detail-item">
              <span class="label">الوقت:</span>
              <span class="value">${this.formatTime(activity.time)}</span>
            </div>
            <div class="detail-item">
              <span class="label">المكان:</span>
              <span class="value">${activity.location}</span>
            </div>
            <div class="detail-item">
              <span class="label">المنظم:</span>
              <span class="value">${activity.organizer}</span>
            </div>
          </div>
        </div>
        
        ${activity.requirements && activity.requirements.length > 0 ? `
          <div class="detail-section">
            <h4>المتطلبات</h4>
            <ul class="requirements-list">
              ${activity.requirements.map(req => `<li>${req}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;

    this.uiManager.showModal({
      title: activity.title,
      content: detailsContent,
      type: 'custom'
    });
  }

  private handleShareActivity(activityId: string): void {
    const activity = this.activities.find(a => a.id === activityId);
    if (!activity) return;

    if (navigator.share) {
      navigator.share({
        title: activity.title,
        text: activity.description,
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      const shareText = `${activity.title}\n${activity.description}\n${window.location.href}`;
      navigator.clipboard.writeText(shareText).then(() => {
        this.uiManager.showToast('تم نسخ رابط النشاط', { type: 'success' });
      }).catch(() => {
        this.uiManager.showToast('فشل في نسخ الرابط', { type: 'error' });
      });
    }
  }

  private handleAddActivity(): void {
    this.uiManager.showToast('إضافة الأنشطة متاحة للقادة فقط', { type: 'info' });
  }

  private handleSearch(): void {
    this.uiManager.showToast('البحث قيد التطوير', { type: 'info' });
  }

  private handleAdvancedFilter(): void {
    this.uiManager.showToast('المرشحات المتقدمة قيد التطوير', { type: 'info' });
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
}