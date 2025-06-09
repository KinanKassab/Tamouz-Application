import { createClient } from '@supabase/supabase-js';
import { CreativeCommons as createIcons, Mic as icons } from 'lucide';
import './styles/main.css';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// App state
let currentUser = null;
let currentPage = 'home';

// Initialize the application
async function initApp() {
  try {
    // Initialize Lucide icons
    createIcons({ icons });
    
    // Check authentication status
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      currentUser = session.user;
      await loadMainApp();
    } else {
      await loadAuthScreen();
    }
    
    // Hide loading screen
    hideLoadingScreen();
    
    // Setup event listeners
    setupEventListeners();
    
    // Register service worker
    registerServiceWorker();
    
  } catch (error) {
    console.error('Error initializing app:', error);
    hideLoadingScreen();
    showError('حدث خطأ في تحميل التطبيق');
  }
}

// Load authentication screen
async function loadAuthScreen() {
  const authContainer = document.getElementById('auth-container');
  authContainer.style.display = 'flex';
  
  authContainer.innerHTML = `
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
  `;
  
  // Re-initialize icons for new content
  createIcons({ icons });
  
  // Setup auth event listeners
  setupAuthEventListeners();
}

// Load main application
async function loadMainApp() {
  const authContainer = document.getElementById('auth-container');
  const mainApp = document.getElementById('main-app');
  
  authContainer.style.display = 'none';
  mainApp.style.display = 'block';
  
  // Load user profile
  await loadUserProfile();
  
  // Load home page by default
  await loadPage('home');
  
  // Setup navigation
  setupNavigation();
}

// Load user profile
async function loadUserProfile() {
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', currentUser.id)
      .single();
    
    if (profile) {
      document.getElementById('userName').textContent = profile.full_name || 'مرحباً';
      document.getElementById('userRole').textContent = getRoleDisplayName(profile.role);
      document.getElementById('menuUserName').textContent = profile.full_name || 'اسم المستخدم';
      document.getElementById('menuUserEmail').textContent = profile.email;
      
      if (profile.avatar_url) {
        document.querySelector('#userAvatar img').src = profile.avatar_url;
        document.querySelector('.menu-avatar img').src = profile.avatar_url;
      }
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
  }
}

// Get role display name
function getRoleDisplayName(role) {
  const roleNames = {
    'guest': 'ضيف',
    'member': 'عضو',
    'leader': 'قائد',
    'admin': 'مدير'
  };
  return roleNames[role] || 'عضو';
}

// Load page content
async function loadPage(pageName) {
  const mainContent = document.getElementById('mainContent');
  currentPage = pageName;
  
  // Update navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === pageName) {
      item.classList.add('active');
    }
  });
  
  try {
    let content = '';
    
    switch (pageName) {
      case 'home':
        content = await getHomeContent();
        break;
      case 'activities':
        content = await getActivitiesContent();
        break;
      case 'skills':
        content = await getSkillsContent();
        break;
      case 'community':
        content = await getCommunityContent();
        break;
      case 'profile':
        content = await getProfileContent();
        break;
      default:
        content = '<div class="error-page"><h2>الصفحة غير موجودة</h2></div>';
    }
    
    mainContent.innerHTML = content;
    createIcons({ icons });
    
    // Setup page-specific event listeners
    setupPageEventListeners(pageName);
    
  } catch (error) {
    console.error('Error loading page:', error);
    mainContent.innerHTML = '<div class="error-page"><h2>حدث خطأ في تحميل الصفحة</h2></div>';
  }
}

// Get home page content
async function getHomeContent() {
  return `
    <div class="page-content">
      <div class="welcome-section">
        <div class="welcome-card">
          <div class="welcome-icon">
            <i data-lucide="tent"></i>
          </div>
          <h2>مرحباً بك في كشافة تموز</h2>
          <p>استعد لمغامرات جديدة ومهارات مفيدة!</p>
        </div>
      </div>

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

      <div class="recent-activities">
        <h3>الأنشطة الحديثة</h3>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon camping">
              <i data-lucide="tent"></i>
            </div>
            <div class="activity-info">
              <h4>رحلة تخييم جبال الشوف</h4>
              <p>15 يناير - رحلة تخييم لمدة يومين</p>
              <span class="activity-status upcoming">قادم</span>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon workshop">
              <i data-lucide="heart-pulse"></i>
            </div>
            <div class="activity-info">
              <h4>ورشة الإسعافات الأولية</h4>
              <p>18 يناير - تعلم أساسيات الإسعاف</p>
              <span class="activity-status registered">مسجل</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Get activities page content
async function getActivitiesContent() {
  return `
    <div class="page-content">
      <div class="page-header">
        <h2>الأنشطة والفعاليات</h2>
        <button class="header-btn" data-action="add-activity">
          <i data-lucide="plus"></i>
          إضافة نشاط
        </button>
      </div>

      <div class="filter-tabs">
        <button class="filter-tab active" data-filter="all">الكل</button>
        <button class="filter-tab" data-filter="upcoming">القادمة</button>
        <button class="filter-tab" data-filter="registered">مسجل بها</button>
        <button class="filter-tab" data-filter="completed">مكتملة</button>
      </div>

      <div class="activities-grid">
        <div class="activity-card camping">
          <div class="activity-header">
            <div class="activity-date">
              <span class="day">15</span>
              <span class="month">يناير</span>
            </div>
            <div class="activity-type">
              <i data-lucide="tent"></i>
            </div>
          </div>
          <div class="activity-content">
            <h3>رحلة تخييم جبال الشوف</h3>
            <p>رحلة تخييم لمدة يومين مع أنشطة متنوعة في الطبيعة</p>
            <div class="activity-meta">
              <span><i data-lucide="clock"></i> 6:00 صباحاً</span>
              <span><i data-lucide="map-pin"></i> جبال الشوف</span>
              <span><i data-lucide="users"></i> 25 مشارك</span>
            </div>
          </div>
          <div class="activity-actions">
            <button class="btn primary">انضمام</button>
            <button class="btn secondary">تفاصيل</button>
          </div>
        </div>

        <div class="activity-card workshop">
          <div class="activity-header">
            <div class="activity-date">
              <span class="day">18</span>
              <span class="month">يناير</span>
            </div>
            <div class="activity-type">
              <i data-lucide="heart-pulse"></i>
            </div>
          </div>
          <div class="activity-content">
            <h3>ورشة الإسعافات الأولية</h3>
            <p>تعلم أساسيات الإسعافات الأولية والتعامل مع الطوارئ</p>
            <div class="activity-meta">
              <span><i data-lucide="clock"></i> 2:00 مساءً</span>
              <span><i data-lucide="map-pin"></i> مقر الفوج</span>
              <span><i data-lucide="users"></i> 15 مشارك</span>
            </div>
          </div>
          <div class="activity-actions">
            <button class="btn success">مسجل</button>
            <button class="btn secondary">تفاصيل</button>
          </div>
        </div>

        <div class="activity-card meeting">
          <div class="activity-header">
            <div class="activity-date">
              <span class="day">22</span>
              <span class="month">يناير</span>
            </div>
            <div class="activity-type">
              <i data-lucide="users"></i>
            </div>
          </div>
          <div class="activity-content">
            <h3>اجتماع شهري للقادة</h3>
            <p>مناقشة خطط الشهر القادم والتحضيرات</p>
            <div class="activity-meta">
              <span><i data-lucide="clock"></i> 7:00 مساءً</span>
              <span><i data-lucide="map-pin"></i> مقر الفوج</span>
              <span><i data-lucide="users"></i> 8 مشاركين</span>
            </div>
          </div>
          <div class="activity-actions">
            <button class="btn warning">مدعو</button>
            <button class="btn secondary">تفاصيل</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Get skills page content
async function getSkillsContent() {
  return `
    <div class="page-content">
      <div class="page-header">
        <h2>المهارات الكشفية</h2>
        <div class="search-box">
          <i data-lucide="search"></i>
          <input type="text" placeholder="ابحث عن مهارة..." />
        </div>
      </div>

      <div class="skills-categories">
        <button class="category-btn active" data-category="all">الكل</button>
        <button class="category-btn" data-category="knots">العقد</button>
        <button class="category-btn" data-category="survival">البقاء</button>
        <button class="category-btn" data-category="navigation">التوجه</button>
        <button class="category-btn" data-category="first-aid">الإسعاف</button>
      </div>

      <div class="skills-grid">
        <div class="skill-card" data-category="knots">
          <div class="skill-icon">
            <i data-lucide="link"></i>
          </div>
          <div class="skill-info">
            <h3>العقدة المربعة</h3>
            <p>العقدة الأساسية لربط حبلين من نفس السماكة</p>
            <div class="skill-difficulty">
              <span>المستوى:</span>
              <div class="difficulty-stars">
                <i data-lucide="star" class="filled"></i>
                <i data-lucide="star"></i>
                <i data-lucide="star"></i>
              </div>
            </div>
          </div>
          <div class="skill-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: 80%"></div>
            </div>
            <span class="progress-text">80%</span>
          </div>
        </div>

        <div class="skill-card" data-category="survival">
          <div class="skill-icon">
            <i data-lucide="flame"></i>
          </div>
          <div class="skill-info">
            <h3>إشعال النار</h3>
            <p>طرق مختلفة لإشعال النار في الطبيعة</p>
            <div class="skill-difficulty">
              <span>المستوى:</span>
              <div class="difficulty-stars">
                <i data-lucide="star" class="filled"></i>
                <i data-lucide="star" class="filled"></i>
                <i data-lucide="star"></i>
              </div>
            </div>
          </div>
          <div class="skill-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: 60%"></div>
            </div>
            <span class="progress-text">60%</span>
          </div>
        </div>

        <div class="skill-card" data-category="navigation">
          <div class="skill-icon">
            <i data-lucide="compass"></i>
          </div>
          <div class="skill-info">
            <h3>استخدام البوصلة</h3>
            <p>قراءة البوصلة والتوجه بدقة</p>
            <div class="skill-difficulty">
              <span>المستوى:</span>
              <div class="difficulty-stars">
                <i data-lucide="star" class="filled"></i>
                <i data-lucide="star" class="filled"></i>
                <i data-lucide="star"></i>
              </div>
            </div>
          </div>
          <div class="skill-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: 90%"></div>
            </div>
            <span class="progress-text">90%</span>
          </div>
        </div>

        <div class="skill-card" data-category="first-aid">
          <div class="skill-icon">
            <i data-lucide="heart-pulse"></i>
          </div>
          <div class="skill-info">
            <h3>الإسعافات الأولية</h3>
            <p>تعلم أساسيات الإسعاف والطوارئ</p>
            <div class="skill-difficulty">
              <span>المستوى:</span>
              <div class="difficulty-stars">
                <i data-lucide="star" class="filled"></i>
                <i data-lucide="star" class="filled"></i>
                <i data-lucide="star" class="filled"></i>
              </div>
            </div>
          </div>
          <div class="skill-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: 45%"></div>
            </div>
            <span class="progress-text">45%</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Get community page content
async function getCommunityContent() {
  return `
    <div class="page-content">
      <div class="page-header">
        <h2>مجتمع الكشافة</h2>
        <button class="header-btn" data-action="new-post">
          <i data-lucide="plus"></i>
          منشور جديد
        </button>
      </div>

      <div class="community-tabs">
        <button class="tab-btn active" data-tab="feed">التغذية</button>
        <button class="tab-btn" data-tab="members">الأعضاء</button>
        <button class="tab-btn" data-tab="groups">المجموعات</button>
      </div>

      <div class="feed-content">
        <div class="post-card">
          <div class="post-header">
            <div class="post-author">
              <img src="/images/default-avatar.png" alt="أحمد محمد" />
              <div class="author-info">
                <h4>أحمد محمد</h4>
                <span>قائد الفوج • منذ ساعتين</span>
              </div>
            </div>
            <button class="post-menu">
              <i data-lucide="more-horizontal"></i>
            </button>
          </div>
          <div class="post-content">
            <p>تذكير برحلة التخييم القادمة يوم الجمعة. يرجى إحضار جميع المعدات المطلوبة والتجمع في المقر الساعة 6:00 صباحاً.</p>
            <div class="post-image">
              <img src="https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg" alt="رحلة تخييم" />
            </div>
          </div>
          <div class="post-actions">
            <button class="action-btn">
              <i data-lucide="heart"></i>
              <span>12</span>
            </button>
            <button class="action-btn">
              <i data-lucide="message-circle"></i>
              <span>5</span>
            </button>
            <button class="action-btn">
              <i data-lucide="share"></i>
              <span>مشاركة</span>
            </button>
          </div>
        </div>

        <div class="post-card">
          <div class="post-header">
            <div class="post-author">
              <img src="/images/default-avatar.png" alt="فاطمة علي" />
              <div class="author-info">
                <h4>فاطمة علي</h4>
                <span>مساعد القائد • أمس</span>
              </div>
            </div>
            <button class="post-menu">
              <i data-lucide="more-horizontal"></i>
            </button>
          </div>
          <div class="post-content">
            <p>تهانينا لجميع الأعضاء الذين حصلوا على شارات جديدة هذا الأسبوع! 🏆</p>
          </div>
          <div class="post-actions">
            <button class="action-btn">
              <i data-lucide="heart"></i>
              <span>24</span>
            </button>
            <button class="action-btn">
              <i data-lucide="message-circle"></i>
              <span>8</span>
            </button>
            <button class="action-btn">
              <i data-lucide="share"></i>
              <span>مشاركة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Get profile page content
async function getProfileContent() {
  return `
    <div class="page-content">
      <div class="profile-header">
        <div class="profile-avatar-large">
          <img src="/images/default-avatar.png" alt="صورة الملف الشخصي" />
          <button class="change-avatar-btn">
            <i data-lucide="camera"></i>
          </button>
        </div>
        <div class="profile-info">
          <h2 id="profileName">كنان قصاب</h2>
          <p id="profileRole">عضو نشط</p>
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
          </div>
        </div>
      </div>

      <div class="profile-sections">
        <div class="profile-section">
          <h3>المعلومات الشخصية</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>البريد الإلكتروني</label>
              <span>kinan@example.com</span>
            </div>
            <div class="info-item">
              <label>تاريخ الانضمام</label>
              <span>يناير 2022</span>
            </div>
            <div class="info-item">
              <label>الهاتف</label>
              <span>+961 70 123 456</span>
            </div>
            <div class="info-item">
              <label>العنوان</label>
              <span>بيروت، لبنان</span>
            </div>
          </div>
          <button class="btn secondary">تعديل المعلومات</button>
        </div>

        <div class="profile-section">
          <h3>الشارات المكتسبة</h3>
          <div class="badges-grid">
            <div class="badge-item earned">
              <div class="badge-icon">🏕️</div>
              <span>خبير التخييم</span>
            </div>
            <div class="badge-item earned">
              <div class="badge-icon">🧭</div>
              <span>ملاح ماهر</span>
            </div>
            <div class="badge-item earned">
              <div class="badge-icon">🏥</div>
              <span>مسعف أولي</span>
            </div>
            <div class="badge-item in-progress">
              <div class="badge-icon">🔥</div>
              <span>خبير النار</span>
            </div>
          </div>
        </div>

        <div class="profile-section">
          <h3>الأنشطة الأخيرة</h3>
          <div class="recent-activities-list">
            <div class="activity-item">
              <div class="activity-icon">
                <i data-lucide="tent"></i>
              </div>
              <div class="activity-details">
                <h4>رحلة تخييم جبال الشوف</h4>
                <p>15 ديسمبر 2024</p>
              </div>
              <span class="activity-status completed">مكتمل</span>
            </div>
            <div class="activity-item">
              <div class="activity-icon">
                <i data-lucide="heart-pulse"></i>
              </div>
              <div class="activity-details">
                <h4>ورشة الإسعافات الأولية</h4>
                <p>10 ديسمبر 2024</p>
              </div>
              <span class="activity-status completed">مكتمل</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Setup authentication event listeners
function setupAuthEventListeners() {
  // Tab switching
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      
      // Update active tab
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active form
      document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
      document.getElementById(tabName + 'Form').classList.add('active');
    });
  });

  // Password toggle
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      const icon = btn.querySelector('i');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.setAttribute('data-lucide', 'eye-off');
      } else {
        input.type = 'password';
        icon.setAttribute('data-lucide', 'eye');
      }
      
      createIcons({ icons });
    });
  });

  // Login form
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
      showLoading('جاري تسجيل الدخول...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      currentUser = data.user;
      await loadMainApp();
      hideLoading();
      showSuccess('تم تسجيل الدخول بنجاح!');
      
    } catch (error) {
      hideLoading();
      showError(error.message || 'حدث خطأ في تسجيل الدخول');
    }
  });

  // Register form
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (password !== confirmPassword) {
      showError('كلمات المرور غير متطابقة');
      return;
    }
    
    try {
      showLoading('جاري إنشاء الحساب...');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });
      
      if (error) throw error;
      
      // Create user profile
      if (data.user) {
        await supabase.from('user_profiles').insert({
          user_id: data.user.id,
          email: email,
          full_name: name,
          role: 'guest',
          status: 'pending'
        });
      }
      
      hideLoading();
      showSuccess('تم إنشاء الحساب بنجاح! يرجى تفعيل حسابك من البريد الإلكتروني');
      
      // Switch to login tab
      document.querySelector('[data-tab="login"]').click();
      
    } catch (error) {
      hideLoading();
      showError(error.message || 'حدث خطأ في إنشاء الحساب');
    }
  });

  // Forgot password
  document.getElementById('forgotPasswordBtn').addEventListener('click', async () => {
    const email = prompt('أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور:');
    
    if (email) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        
        if (error) throw error;
        
        showSuccess('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
        
      } catch (error) {
        showError(error.message || 'حدث خطأ في إرسال البريد الإلكتروني');
      }
    }
  });
}

// Setup main event listeners
function setupEventListeners() {
  // Menu toggle
  document.getElementById('menuBtn').addEventListener('click', () => {
    document.getElementById('side-menu').classList.add('active');
    document.getElementById('overlay').classList.add('active');
  });

  // Close menu
  document.getElementById('closeMenu').addEventListener('click', () => {
    document.getElementById('side-menu').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
  });

  // Notifications toggle
  document.getElementById('notificationBtn').addEventListener('click', () => {
    document.getElementById('notifications-panel').classList.add('active');
    document.getElementById('overlay').classList.add('active');
  });

  // Close notifications
  document.getElementById('closeNotifications').addEventListener('click', () => {
    document.getElementById('notifications-panel').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
  });

  // Overlay click
  document.getElementById('overlay').addEventListener('click', () => {
    document.getElementById('side-menu').classList.remove('active');
    document.getElementById('notifications-panel').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
      await supabase.auth.signOut();
      currentUser = null;
      await loadAuthScreen();
      showSuccess('تم تسجيل الخروج بنجاح');
    } catch (error) {
      showError('حدث خطأ في تسجيل الخروج');
    }
  });
}

// Setup navigation
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      loadPage(page);
    });
  });
}

// Setup page-specific event listeners
function setupPageEventListeners(pageName) {
  switch (pageName) {
    case 'home':
      setupHomeEventListeners();
      break;
    case 'activities':
      setupActivitiesEventListeners();
      break;
    case 'skills':
      setupSkillsEventListeners();
      break;
    case 'community':
      setupCommunityEventListeners();
      break;
    case 'profile':
      setupProfileEventListeners();
      break;
  }
}

// Setup home page event listeners
function setupHomeEventListeners() {
  document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('click', () => {
      const action = card.dataset.action;
      handleQuickAction(action);
    });
  });
}

// Setup activities page event listeners
function setupActivitiesEventListeners() {
  // Filter tabs
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const filter = tab.dataset.filter;
      filterActivities(filter);
    });
  });

  // Activity buttons
  document.querySelectorAll('.activity-card .btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.textContent.trim();
      handleActivityAction(action, btn);
    });
  });
}

// Setup skills page event listeners
function setupSkillsEventListeners() {
  // Category buttons
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const category = btn.dataset.category;
      filterSkills(category);
    });
  });

  // Skill cards
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('click', () => {
      showSkillDetails(card);
    });
  });
}

// Setup community page event listeners
function setupCommunityEventListeners() {
  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const tab = btn.dataset.tab;
      switchCommunityTab(tab);
    });
  });

  // Post actions
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      handlePostAction(btn);
    });
  });
}

// Setup profile page event listeners
function setupProfileEventListeners() {
  // Change avatar button
  const changeAvatarBtn = document.querySelector('.change-avatar-btn');
  if (changeAvatarBtn) {
    changeAvatarBtn.addEventListener('click', () => {
      handleAvatarChange();
    });
  }

  // Edit info button
  const editBtn = document.querySelector('.profile-section .btn.secondary');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      handleEditProfile();
    });
  }
}

// Handle quick actions
function handleQuickAction(action) {
  switch (action) {
    case 'attendance':
      showSuccess('تم تسجيل حضورك بنجاح!');
      break;
    case 'badges':
      loadPage('profile');
      break;
    case 'gallery':
      showInfo('معرض الصور قيد التطوير');
      break;
    case 'messages':
      showInfo('نظام الرسائل قيد التطوير');
      break;
  }
}

// Handle activity actions
function handleActivityAction(action, btn) {
  switch (action) {
    case 'انضمام':
      btn.textContent = 'مسجل';
      btn.className = 'btn success';
      showSuccess('تم التسجيل في النشاط بنجاح!');
      break;
    case 'تفاصيل':
      showInfo('تفاصيل النشاط قيد التطوير');
      break;
  }
}

// Filter activities
function filterActivities(filter) {
  const cards = document.querySelectorAll('.activity-card');
  cards.forEach(card => {
    // Simple filter logic - in real app, this would be more sophisticated
    card.style.display = 'block';
  });
}

// Filter skills
function filterSkills(category) {
  const cards = document.querySelectorAll('.skill-card');
  cards.forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Show skill details
function showSkillDetails(card) {
  const skillName = card.querySelector('h3').textContent;
  showInfo(`تفاصيل مهارة: ${skillName} قيد التطوير`);
}

// Switch community tab
function switchCommunityTab(tab) {
  // In a real app, this would load different content
  showInfo(`تبويب ${tab} قيد التطوير`);
}

// Handle post actions
function handlePostAction(btn) {
  const icon = btn.querySelector('i');
  const iconName = icon.getAttribute('data-lucide');
  
  if (iconName === 'heart') {
    icon.style.color = icon.style.color === 'red' ? '' : 'red';
    const count = btn.querySelector('span');
    const currentCount = parseInt(count.textContent);
    count.textContent = icon.style.color === 'red' ? currentCount + 1 : currentCount - 1;
  }
}

// Handle avatar change
function handleAvatarChange() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.querySelector('.profile-avatar-large img').src = e.target.result;
        showSuccess('تم تحديث الصورة الشخصية!');
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

// Handle edit profile
function handleEditProfile() {
  showInfo('تعديل الملف الشخصي قيد التطوير');
}

// Utility functions
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  loadingScreen.style.opacity = '0';
  setTimeout(() => {
    loadingScreen.style.display = 'none';
  }, 300);
}

function showLoading(message = 'جاري التحميل...') {
  // Implementation for loading indicator
  console.log(message);
}

function hideLoading() {
  // Implementation for hiding loading indicator
}

function showSuccess(message) {
  showToast(message, 'success');
}

function showError(message) {
  showToast(message, 'error');
}

function showInfo(message) {
  showToast(message, 'info');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Register service worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    currentUser = session.user;
    loadMainApp();
  } else if (event === 'SIGNED_OUT') {
    currentUser = null;
    loadAuthScreen();
  }
});

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);