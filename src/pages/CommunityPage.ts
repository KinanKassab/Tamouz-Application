import { BaseComponent } from '../components/BaseComponent';
import { StateManager } from '../core/StateManager';
import { MockDataService } from '../services/MockDataService';
import { UIManager } from '../core/UIManager';
import { Post } from '../types';

export class CommunityPage extends BaseComponent {
  private mockDataService: MockDataService;
  private uiManager: UIManager;
  private posts: Post[] = [];
  private currentTab = 'feed';

  constructor(stateManager: StateManager) {
    super(stateManager);
    this.mockDataService = new MockDataService();
    this.uiManager = new UIManager(stateManager);
    this.posts = this.mockDataService.getMockPosts();
  }

  render(): string {
    return `
      <div class="app-layout">
        ${this.renderHeader()}
        
        <main class="main-content">
          <div class="page-content">
            ${this.renderPageHeader()}
            ${this.renderTabs()}
            ${this.renderTabContent()}
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
            <h1>مجتمع الكشافة</h1>
          </div>
          
          <div class="header-actions">
            <button class="search-btn" id="searchBtn">
              <i data-lucide="search"></i>
            </button>
            <button class="new-post-btn" id="newPostBtn">
              <i data-lucide="plus"></i>
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
          <h2>مجتمع الكشافة</h2>
          <p>تواصل مع أعضاء الفوج وشارك تجاربك</p>
        </div>
        <div class="community-stats">
          <div class="stat">
            <span class="number">156</span>
            <span class="label">عضو نشط</span>
          </div>
          <div class="stat">
            <span class="number">42</span>
            <span class="label">منشور هذا الأسبوع</span>
          </div>
          <div class="stat">
            <span class="number">8</span>
            <span class="label">مجموعة</span>
          </div>
        </div>
      </div>
    `;
  }

  private renderTabs(): string {
    const tabs = [
      { key: 'feed', label: 'التغذية', icon: 'home' },
      { key: 'members', label: 'الأعضاء', icon: 'users' },
      { key: 'groups', label: 'المجموعات', icon: 'users-2' },
      { key: 'events', label: 'الأحداث', icon: 'calendar' }
    ];

    return `
      <div class="community-tabs">
        ${tabs.map(tab => `
          <button class="tab-btn ${tab.key === this.currentTab ? 'active' : ''}" 
                  data-tab="${tab.key}">
            <i data-lucide="${tab.icon}"></i>
            <span>${tab.label}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  private renderTabContent(): string {
    switch (this.currentTab) {
      case 'feed':
        return this.renderFeedContent();
      case 'members':
        return this.renderMembersContent();
      case 'groups':
        return this.renderGroupsContent();
      case 'events':
        return this.renderEventsContent();
      default:
        return this.renderFeedContent();
    }
  }

  private renderFeedContent(): string {
    return `
      <div class="feed-content">
        ${this.renderNewPostCard()}
        <div class="posts-list">
          ${this.posts.map(post => this.renderPostCard(post)).join('')}
        </div>
      </div>
    `;
  }

  private renderNewPostCard(): string {
    const state = this.stateManager.getState();
    const user = state.currentUser;

    return `
      <div class="new-post-card">
        <div class="post-input">
          <img src="${user?.avatarUrl || '/images/default-avatar.png'}" alt="صورتك" class="user-avatar" />
          <button class="post-input-btn" id="createPostBtn">
            ما الذي تريد مشاركته؟
          </button>
        </div>
        <div class="post-actions">
          <button class="post-action-btn" data-action="photo">
            <i data-lucide="camera"></i>
            صورة
          </button>
          <button class="post-action-btn" data-action="video">
            <i data-lucide="video"></i>
            فيديو
          </button>
          <button class="post-action-btn" data-action="poll">
            <i data-lucide="bar-chart-3"></i>
            استطلاع
          </button>
        </div>
      </div>
    `;
  }

  private renderPostCard(post: Post): string {
    return `
      <div class="post-card" data-post-id="${post.id}">
        <div class="post-header">
          <div class="post-author">
            <img src="${post.authorAvatar || '/images/default-avatar.png'}" alt="${post.authorName}" />
            <div class="author-info">
              <h4>${post.authorName}</h4>
              <span class="post-time">${this.formatRelativeTime(post.createdAt)}</span>
            </div>
          </div>
          <button class="post-menu" data-post-id="${post.id}">
            <i data-lucide="more-horizontal"></i>
          </button>
        </div>
        
        <div class="post-content">
          <p>${post.content}</p>
          ${post.imageUrl ? `
            <div class="post-image">
              <img src="${post.imageUrl}" alt="صورة المنشور" loading="lazy" />
            </div>
          ` : ''}
        </div>
        
        <div class="post-stats">
          <span class="stat">${post.likes} إعجاب</span>
          <span class="stat">${post.comments} تعليق</span>
        </div>
        
        <div class="post-actions">
          <button class="action-btn ${post.isLiked ? 'liked' : ''}" data-action="like" data-post-id="${post.id}">
            <i data-lucide="heart"></i>
            <span>إعجاب</span>
          </button>
          <button class="action-btn" data-action="comment" data-post-id="${post.id}">
            <i data-lucide="message-circle"></i>
            <span>تعليق</span>
          </button>
          <button class="action-btn" data-action="share" data-post-id="${post.id}">
            <i data-lucide="share-2"></i>
            <span>مشاركة</span>
          </button>
        </div>
      </div>
    `;
  }

  private renderMembersContent(): string {
    const members = [
      { id: '1', name: 'أحمد محمد', role: 'قائد الفوج', avatar: '/images/default-avatar.png', isOnline: true },
      { id: '2', name: 'فاطمة علي', role: 'مساعد القائد', avatar: '/images/default-avatar.png', isOnline: false },
      { id: '3', name: 'محمد حسن', role: 'عضو نشط', avatar: '/images/default-avatar.png', isOnline: true },
      { id: '4', name: 'سارة أحمد', role: 'عضو جديد', avatar: '/images/default-avatar.png', isOnline: false },
    ];

    return `
      <div class="members-content">
        <div class="members-search">
          <div class="search-box">
            <i data-lucide="search"></i>
            <input type="text" placeholder="ابحث عن عضو..." id="memberSearch" />
          </div>
          <button class="filter-btn" id="memberFilter">
            <i data-lucide="filter"></i>
          </button>
        </div>
        
        <div class="members-grid">
          ${members.map(member => `
            <div class="member-card" data-member-id="${member.id}">
              <div class="member-avatar">
                <img src="${member.avatar}" alt="${member.name}" />
                <div class="online-status ${member.isOnline ? 'online' : 'offline'}"></div>
              </div>
              <div class="member-info">
                <h4>${member.name}</h4>
                <p>${member.role}</p>
              </div>
              <div class="member-actions">
                <button class="btn btn-primary btn-sm">
                  <i data-lucide="message-circle"></i>
                  رسالة
                </button>
                <button class="btn btn-secondary btn-sm">
                  <i data-lucide="user-plus"></i>
                  متابعة
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderGroupsContent(): string {
    const groups = [
      { id: '1', name: 'قادة الفوج', description: 'مجموعة القادة والمسؤولين', members: 8, image: 'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg' },
      { id: '2', name: 'خبراء التخييم', description: 'لمحبي التخييم والأنشطة الخارجية', members: 24, image: 'https://images.pexels.com/photos/1749900/pexels-photo-1749900.jpeg' },
      { id: '3', name: 'فريق الإسعافات الأولية', description: 'المتخصصون في الإسعافات الأولية', members: 12, image: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg' },
    ];

    return `
      <div class="groups-content">
        <div class="groups-header">
          <button class="btn btn-primary" id="createGroupBtn">
            <i data-lucide="plus"></i>
            إنشاء مجموعة
          </button>
        </div>
        
        <div class="groups-grid">
          ${groups.map(group => `
            <div class="group-card" data-group-id="${group.id}">
              <div class="group-image">
                <img src="${group.image}" alt="${group.name}" loading="lazy" />
              </div>
              <div class="group-content">
                <h4>${group.name}</h4>
                <p>${group.description}</p>
                <div class="group-meta">
                  <span><i data-lucide="users"></i> ${group.members} عضو</span>
                </div>
              </div>
              <div class="group-actions">
                <button class="btn btn-primary btn-sm">انضمام</button>
                <button class="btn btn-secondary btn-sm">عرض</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderEventsContent(): string {
    return `
      <div class="events-content">
        <div class="empty-state">
          <div class="empty-icon">
            <i data-lucide="calendar"></i>
          </div>
          <h3>لا توجد أحداث مجتمعية</h3>
          <p>سيتم عرض الأحداث المجتمعية هنا قريباً</p>
          <button class="btn btn-primary">
            <i data-lucide="plus"></i>
            إنشاء حدث
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
        <a href="#activities" class="nav-item" data-page="activities">
          <i data-lucide="calendar"></i>
          <span>الأنشطة</span>
        </a>
        <a href="#skills" class="nav-item" data-page="skills">
          <i data-lucide="compass"></i>
          <span>المهارات</span>
        </a>
        <a href="#community" class="nav-item active" data-page="community">
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

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = (btn as HTMLElement).dataset.tab;
        if (tab) {
          this.setTab(tab);
        }
      });
    });

    // Post actions
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = (btn as HTMLElement).dataset.action;
        const postId = (btn as HTMLElement).dataset.postId;
        this.handlePostAction(action!, postId!);
      });
    });

    // Create post
    const createPostBtn = document.getElementById('createPostBtn');
    createPostBtn?.addEventListener('click', () => this.handleCreatePost());

    // New post button
    const newPostBtn = document.getElementById('newPostBtn');
    newPostBtn?.addEventListener('click', () => this.handleCreatePost());

    // Post menu
    document.querySelectorAll('.post-menu').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const postId = (btn as HTMLElement).dataset.postId;
        this.handlePostMenu(postId!);
      });
    });

    // Search
    const searchBtn = document.getElementById('searchBtn');
    searchBtn?.addEventListener('click', () => this.handleSearch());
  }

  private setTab(tab: string): void {
    this.currentTab = tab;
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
      if ((btn as HTMLElement).dataset.tab === tab) {
        btn.classList.add('active');
      }
    });

    // Re-render tab content
    const pageContent = document.querySelector('.page-content');
    if (pageContent) {
      const tabContent = pageContent.querySelector('.feed-content, .members-content, .groups-content, .events-content');
      if (tabContent) {
        tabContent.outerHTML = this.renderTabContent();
        this.setupEventListeners(); // Re-setup event listeners for new content
      }
    }
  }

  private handlePostAction(action: string, postId: string): void {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    switch (action) {
      case 'like':
        this.toggleLike(post);
        break;
      case 'comment':
        this.handleComment(post);
        break;
      case 'share':
        this.handleShare(post);
        break;
    }
  }

  private toggleLike(post: Post): void {
    post.isLiked = !post.isLiked;
    post.likes += post.isLiked ? 1 : -1;

    // Update UI
    const likeBtn = document.querySelector(`[data-action="like"][data-post-id="${post.id}"]`);
    const likeStat = document.querySelector(`[data-post-id="${post.id}"] .post-stats .stat:first-child`);
    
    if (likeBtn && likeStat) {
      likeBtn.classList.toggle('liked', post.isLiked);
      likeStat.textContent = `${post.likes} إعجاب`;
    }

    if (post.isLiked) {
      this.uiManager.showToast('تم الإعجاب بالمنشور', { type: 'success' });
    }
  }

  private handleComment(post: Post): void {
    this.uiManager.showModal({
      title: 'إضافة تعليق',
      content: `
        <div class="comment-form">
          <textarea placeholder="اكتب تعليقك هنا..." rows="3"></textarea>
          <div class="comment-actions">
            <button class="btn btn-primary">نشر التعليق</button>
          </div>
        </div>
      `,
      type: 'custom'
    });
  }

  private handleShare(post: Post): void {
    if (navigator.share) {
      navigator.share({
        title: `منشور من ${post.authorName}`,
        text: post.content,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${post.content}\n${window.location.href}`).then(() => {
        this.uiManager.showToast('تم نسخ المنشور', { type: 'success' });
      }).catch(() => {
        this.uiManager.showToast('فشل في نسخ المنشور', { type: 'error' });
      });
    }
  }

  private handleCreatePost(): void {
    this.uiManager.showModal({
      title: 'منشور جديد',
      content: `
        <div class="create-post-form">
          <textarea placeholder="ما الذي تريد مشاركته؟" rows="4"></textarea>
          <div class="post-options">
            <button class="option-btn" data-option="photo">
              <i data-lucide="camera"></i>
              إضافة صورة
            </button>
            <button class="option-btn" data-option="location">
              <i data-lucide="map-pin"></i>
              إضافة موقع
            </button>
          </div>
          <div class="post-actions">
            <button class="btn btn-secondary">حفظ كمسودة</button>
            <button class="btn btn-primary">نشر</button>
          </div>
        </div>
      `,
      type: 'custom'
    });
  }

  private handlePostMenu(postId: string): void {
    this.uiManager.showModal({
      title: 'خيارات المنشور',
      content: `
        <div class="post-menu-options">
          <button class="menu-option" data-action="edit">
            <i data-lucide="edit"></i>
            تعديل المنشور
          </button>
          <button class="menu-option" data-action="save">
            <i data-lucide="bookmark"></i>
            حفظ المنشور
          </button>
          <button class="menu-option" data-action="report">
            <i data-lucide="flag"></i>
            الإبلاغ عن المنشور
          </button>
          <button class="menu-option danger" data-action="delete">
            <i data-lucide="trash-2"></i>
            حذف المنشور
          </button>
        </div>
      `,
      type: 'custom'
    });
  }

  private handleSearch(): void {
    this.uiManager.showToast('البحث في المجتمع قيد التطوير', { type: 'info' });
  }
}