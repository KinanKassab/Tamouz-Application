import { BaseComponent } from '../components/BaseComponent';
import { StateManager } from '../core/StateManager';
import { MockDataService } from '../services/MockDataService';
import { UIManager } from '../core/UIManager';
import { Skill } from '../types';

export class SkillsPage extends BaseComponent {
  private mockDataService: MockDataService;
  private uiManager: UIManager;
  private skills: Skill[] = [];
  private currentCategory = 'all';

  constructor(stateManager: StateManager) {
    super(stateManager);
    this.mockDataService = new MockDataService();
    this.uiManager = new UIManager(stateManager);
    this.skills = this.mockDataService.getMockSkills();
  }

  render(): string {
    return `
      <div class="app-layout">
        ${this.renderHeader()}
        
        <main class="main-content">
          <div class="page-content">
            ${this.renderPageHeader()}
            ${this.renderCategoryTabs()}
            ${this.renderSkillsGrid()}
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
            <h1>المهارات الكشفية</h1>
          </div>
          
          <div class="header-actions">
            <div class="search-box">
              <i data-lucide="search"></i>
              <input type="text" placeholder="ابحث عن مهارة..." id="skillSearch" />
            </div>
          </div>
        </div>
      </header>
    `;
  }

  private renderPageHeader(): string {
    return `
      <div class="page-header">
        <div class="page-title">
          <h2>المهارات الكشفية</h2>
          <p>تعلم وطور مهاراتك الكشفية خطوة بخطوة</p>
        </div>
        <div class="skills-stats">
          <div class="stat">
            <span class="number">${this.skills.length}</span>
            <span class="label">مهارة متاحة</span>
          </div>
          <div class="stat">
            <span class="number">${this.getCompletedSkillsCount()}</span>
            <span class="label">مهارة مكتملة</span>
          </div>
          <div class="stat">
            <span class="number">${this.getAverageProgress()}%</span>
            <span class="label">متوسط التقدم</span>
          </div>
        </div>
      </div>
    `;
  }

  private renderCategoryTabs(): string {
    const categories = [
      { key: 'all', label: 'الكل', icon: 'grid-3x3' },
      { key: 'knots', label: 'العقد', icon: 'link' },
      { key: 'survival', label: 'البقاء', icon: 'flame' },
      { key: 'navigation', label: 'التوجه', icon: 'compass' },
      { key: 'first-aid', label: 'الإسعاف', icon: 'heart-pulse' },
      { key: 'leadership', label: 'القيادة', icon: 'crown' }
    ];

    return `
      <div class="category-tabs">
        ${categories.map(category => `
          <button class="category-btn ${category.key === this.currentCategory ? 'active' : ''}" 
                  data-category="${category.key}">
            <i data-lucide="${category.icon}"></i>
            <span>${category.label}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  private renderSkillsGrid(): string {
    const filteredSkills = this.getFilteredSkills();

    if (filteredSkills.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">
            <i data-lucide="compass"></i>
          </div>
          <h3>لا توجد مهارات</h3>
          <p>لم يتم العثور على مهارات في هذه الفئة</p>
        </div>
      `;
    }

    return `
      <div class="skills-grid">
        ${filteredSkills.map(skill => this.renderSkillCard(skill)).join('')}
      </div>
    `;
  }

  private renderSkillCard(skill: Skill): string {
    return `
      <div class="skill-card" data-skill-id="${skill.id}" data-category="${skill.category}">
        <div class="skill-header">
          <div class="skill-icon">
            <i data-lucide="${this.getSkillIcon(skill.category)}"></i>
          </div>
          <div class="skill-difficulty">
            ${this.renderStars(skill.difficulty)}
          </div>
        </div>
        
        ${skill.imageUrl ? `
          <div class="skill-image">
            <img src="${skill.imageUrl}" alt="${skill.title}" loading="lazy" />
          </div>
        ` : ''}
        
        <div class="skill-content">
          <h3>${skill.title}</h3>
          <p>${skill.description}</p>
          
          <div class="skill-meta">
            <span class="category-badge">${this.getCategoryDisplayName(skill.category)}</span>
            <span class="difficulty-text">${this.getDifficultyText(skill.difficulty)}</span>
          </div>
        </div>
        
        <div class="skill-progress">
          <div class="progress-header">
            <span>التقدم</span>
            <span class="progress-percentage">${skill.progress}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${skill.progress}%"></div>
          </div>
        </div>
        
        <div class="skill-actions">
          <button class="btn btn-primary learn-btn" data-skill-id="${skill.id}">
            <i data-lucide="play"></i>
            ${skill.progress > 0 ? 'متابعة التعلم' : 'بدء التعلم'}
          </button>
          <button class="btn btn-secondary details-btn" data-skill-id="${skill.id}">
            <i data-lucide="info"></i>
            تفاصيل
          </button>
        </div>
      </div>
    `;
  }

  private renderStars(difficulty: number): string {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(`
        <i data-lucide="star" class="${i <= difficulty ? 'filled' : ''}"></i>
      `);
    }
    return `<div class="difficulty-stars">${stars.join('')}</div>`;
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
        <a href="#skills" class="nav-item active" data-page="skills">
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

    // Category tabs
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const category = (btn as HTMLElement).dataset.category;
        if (category) {
          this.setCategory(category);
        }
      });
    });

    // Skill actions
    document.querySelectorAll('.learn-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const skillId = (btn as HTMLElement).dataset.skillId;
        this.handleLearnSkill(skillId!);
      });
    });

    document.querySelectorAll('.details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const skillId = (btn as HTMLElement).dataset.skillId;
        this.handleShowSkillDetails(skillId!);
      });
    });

    // Skill card click
    document.querySelectorAll('.skill-card').forEach(card => {
      card.addEventListener('click', () => {
        const skillId = (card as HTMLElement).dataset.skillId;
        this.handleShowSkillDetails(skillId!);
      });
    });

    // Search
    const searchInput = document.getElementById('skillSearch') as HTMLInputElement;
    searchInput?.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value;
      this.handleSearch(query);
    });
  }

  private setCategory(category: string): void {
    this.currentCategory = category;
    
    // Update active tab
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.remove('active');
      if ((btn as HTMLElement).dataset.category === category) {
        btn.classList.add('active');
      }
    });

    // Re-render skills grid
    const skillsGrid = document.querySelector('.skills-grid');
    if (skillsGrid) {
      skillsGrid.innerHTML = this.renderSkillsGrid().replace(/<div class="skills-grid">|<\/div>$/g, '');
    }
  }

  private getFilteredSkills(): Skill[] {
    if (this.currentCategory === 'all') {
      return this.skills;
    }
    return this.skills.filter(skill => skill.category === this.currentCategory);
  }

  private handleLearnSkill(skillId: string): void {
    const skill = this.skills.find(s => s.id === skillId);
    if (!skill) return;

    // Mock learning progress
    if (skill.progress < 100) {
      skill.progress = Math.min(100, skill.progress + 20);
      
      // Update progress bar
      const card = document.querySelector(`[data-skill-id="${skillId}"]`);
      const progressFill = card?.querySelector('.progress-fill') as HTMLElement;
      const progressText = card?.querySelector('.progress-percentage');
      
      if (progressFill && progressText) {
        progressFill.style.width = `${skill.progress}%`;
        progressText.textContent = `${skill.progress}%`;
      }

      this.uiManager.showToast(`تقدمت في مهارة "${skill.title}"!`, { type: 'success' });
    } else {
      this.uiManager.showToast('تهانينا! لقد أتممت هذه المهارة', { type: 'success' });
    }
  }

  private handleShowSkillDetails(skillId: string): void {
    const skill = this.skills.find(s => s.id === skillId);
    if (!skill) return;

    const detailsContent = `
      <div class="skill-details">
        <div class="detail-header">
          <div class="skill-icon-large">
            <i data-lucide="${this.getSkillIcon(skill.category)}"></i>
          </div>
          <div class="skill-info">
            <h3>${skill.title}</h3>
            <div class="skill-meta">
              <span class="category">${this.getCategoryDisplayName(skill.category)}</span>
              <div class="difficulty">
                ${this.renderStars(skill.difficulty)}
                <span>${this.getDifficultyText(skill.difficulty)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>الوصف</h4>
          <p>${skill.description}</p>
        </div>
        
        ${skill.steps && skill.steps.length > 0 ? `
          <div class="detail-section">
            <h4>خطوات التعلم</h4>
            <ol class="steps-list">
              ${skill.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
          </div>
        ` : ''}
        
        ${skill.resources && skill.resources.length > 0 ? `
          <div class="detail-section">
            <h4>المصادر</h4>
            <ul class="resources-list">
              ${skill.resources.map(resource => `<li>${resource}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        <div class="detail-section">
          <h4>التقدم الحالي</h4>
          <div class="progress-display">
            <div class="progress-bar large">
              <div class="progress-fill" style="width: ${skill.progress}%"></div>
            </div>
            <span class="progress-text">${skill.progress}% مكتمل</span>
          </div>
        </div>
      </div>
    `;

    this.uiManager.showModal({
      title: 'تفاصيل المهارة',
      content: detailsContent,
      type: 'custom'
    });
  }

  private handleSearch(query: string): void {
    const cards = document.querySelectorAll('.skill-card');
    
    cards.forEach(card => {
      const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
      const description = card.querySelector('p')?.textContent?.toLowerCase() || '';
      const searchQuery = query.toLowerCase();
      
      if (title.includes(searchQuery) || description.includes(searchQuery) || query === '') {
        (card as HTMLElement).style.display = 'block';
      } else {
        (card as HTMLElement).style.display = 'none';
      }
    });
  }

  private getCompletedSkillsCount(): number {
    return this.skills.filter(skill => skill.progress === 100).length;
  }

  private getAverageProgress(): number {
    const totalProgress = this.skills.reduce((sum, skill) => sum + skill.progress, 0);
    return Math.round(totalProgress / this.skills.length);
  }

  private getSkillIcon(category: string): string {
    const icons: Record<string, string> = {
      'knots': 'link',
      'survival': 'flame',
      'navigation': 'compass',
      'first-aid': 'heart-pulse',
      'leadership': 'crown',
      'outdoor': 'mountain'
    };
    return icons[category] || 'compass';
  }

  private getCategoryDisplayName(category: string): string {
    const names: Record<string, string> = {
      'knots': 'العقد',
      'survival': 'البقاء',
      'navigation': 'التوجه',
      'first-aid': 'الإسعاف',
      'leadership': 'القيادة',
      'outdoor': 'الأنشطة الخارجية'
    };
    return names[category] || category;
  }

  private getDifficultyText(difficulty: number): string {
    const levels = ['', 'مبتدئ', 'سهل', 'متوسط', 'صعب', 'خبير'];
    return levels[difficulty] || 'غير محدد';
  }
}