const contentEl = document.getElementById('content');
const navLinks = document.querySelectorAll('nav a[data-page]');
const moreBtn = document.querySelector('button.more-btn');
const moreDropdown = document.querySelector('.more-dropdown');
const darkModeToggle = document.getElementById('darkModeToggle');

// تحميل الصفحة المطلوبة من ملف HTML داخل مجلد pages
async function loadPage(page) {
  try {
    // إظهار مؤشر التحميل
    showLoadingSpinner();
    
    const response = await fetch(`pages/${page}.html`);
    if (!response.ok) throw new Error('404');
    const html = await response.text();
    
    // إخفاء مؤشر التحميل وعرض المحتوى
    hideLoadingSpinner();
    contentEl.innerHTML = html;
    
    // تشغيل السكريبت الخاص بالصفحة إذا وجد
    executePageScripts();
    
  } catch (err) {
    hideLoadingSpinner();
    contentEl.innerHTML = `
      <div class="error-page">
        <div class="error-icon">😢</div>
        <h2>الصفحة غير موجودة</h2>
        <p>عذراً، لم نتمكن من العثور على الصفحة المطلوبة</p>
        <button class="btn-primary" onclick="loadPage('home')">العودة للرئيسية</button>
      </div>
    `;
  }

  // إزالة "active" من الكل
  navLinks.forEach(link => link.classList.remove('active'));
  moreBtn.classList.remove('active');

  // تفعيل الرابط المناسب
  const matchedLink = Array.from(navLinks).find(link => link.dataset.page === page);
  if (matchedLink) {
    matchedLink.classList.add('active');
  } else {
    const morePages = Array.from(moreDropdown.querySelectorAll('a')).map(link => link.dataset.page);
    if (morePages.includes(page)) {
      moreBtn.classList.add('active');
    }
  }

  // إغلاق القائمة
  moreDropdown.style.display = 'none';
  moreBtn.setAttribute('aria-expanded', 'false');
  
  // حفظ الصفحة الحالية
  localStorage.setItem('currentPage', page);
  
  // تحديث عنوان الصفحة
  updatePageTitle(page);
}

// إظهار مؤشر التحميل
function showLoadingSpinner() {
  contentEl.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>
  `;
}

// إخفاء مؤشر التحميل
function hideLoadingSpinner() {
  const spinner = contentEl.querySelector('.loading-spinner');
  if (spinner) {
    spinner.style.opacity = '0';
    setTimeout(() => {
      if (spinner.parentNode) {
        spinner.remove();
      }
    }, 300);
  }
}

// تشغيل السكريبت الخاص بالصفحة
function executePageScripts() {
  const scripts = contentEl.querySelectorAll('script');
  scripts.forEach(script => {
    const newScript = document.createElement('script');
    newScript.textContent = script.textContent;
    document.head.appendChild(newScript);
    document.head.removeChild(newScript);
  });
}

// تحديث عنوان الصفحة
function updatePageTitle(page) {
  const titles = {
    home: 'الرئيسية',
    schedule: 'الأنشطة',
    guide: 'الدليل',
    songs: 'الأناشيد',
    info: 'المعلومات',
    settings: 'الإعدادات',
    chat: 'المحادثات',
    achievements: 'الإنجازات',
    map: 'الخريطة'
  };
  
  const pageTitle = titles[page] || 'تطبيق الكشاف';
  document.title = `${pageTitle} - كشافة تموز`;
}

// روابط التنقل العادية
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const page = link.dataset.page;
    loadPage(page);
    
    // إضافة تأثير بصري
    link.style.transform = 'scale(0.95)';
    setTimeout(() => {
      link.style.transform = 'scale(1)';
    }, 150);
  });
});

// روابط المزيد
moreDropdown.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    loadPage(link.dataset.page);
  });
});

// فتح/إغلاق زر المزيد
moreBtn.addEventListener('click', e => {
  e.stopPropagation();
  const open = moreDropdown.style.display === 'flex';
  moreDropdown.style.display = open ? 'none' : 'flex';
  moreBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
  
  // إضافة تأثير صوتي إذا كان متاحاً
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
});

// إغلاق القائمة لو ضغطت براها
document.addEventListener('click', () => {
  moreDropdown.style.display = 'none';
  moreBtn.setAttribute('aria-expanded', 'false');
});

// تفعيل الوضع الداكن المحفوظ
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark');
  darkModeToggle.textContent = '☀️';
}

// تبديل الوضع الداكن
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  
  if (document.body.classList.contains('dark')) {
    localStorage.setItem('darkMode', 'enabled');
    darkModeToggle.textContent = '☀️';
    showToast('تم تفعيل الوضع الداكن', 'success');
  } else {
    localStorage.removeItem('darkMode');
    darkModeToggle.textContent = '🌙';
    showToast('تم تفعيل الوضع الفاتح', 'success');
  }
  
  // تأثير بصري
  darkModeToggle.style.transform = 'rotate(360deg)';
  setTimeout(() => {
    darkModeToggle.style.transform = 'rotate(0deg)';
  }, 300);
});

// مراقبة اختصارات لوحة المفاتيح
document.addEventListener('keydown', (e) => {
  // Alt + H للرئيسية
  if (e.altKey && e.key === 'h') {
    e.preventDefault();
    loadPage('home');
  }
  
  // Alt + S للأنشطة
  if (e.altKey && e.key === 's') {
    e.preventDefault();
    loadPage('schedule');
  }
  
  // Alt + G للدليل
  if (e.altKey && e.key === 'g') {
    e.preventDefault();
    loadPage('guide');
  }
  
  // Alt + M للأناشيد
  if (e.altKey && e.key === 'm') {
    e.preventDefault();
    loadPage('songs');
  }
  
  // Escape لإغلاق القوائم
  if (e.key === 'Escape') {
    moreDropdown.style.display = 'none';
    moreBtn.setAttribute('aria-expanded', 'false');
  }
});

// مراقبة حالة الشبكة
window.addEventListener('online', () => {
  showToast('تم الاتصال بالإنترنت', 'success');
  document.body.classList.remove('offline');
  hideConnectionStatus();
});

window.addEventListener('offline', () => {
  showToast('انقطع الاتصال بالإنترنت', 'warning');
  document.body.classList.add('offline');
  showConnectionStatus();
});

// إظهار حالة الاتصال
function showConnectionStatus() {
  const statusEl = document.getElementById('connectionStatus');
  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.textContent = '🔴 غير متصل بالإنترنت';
    statusEl.classList.remove('online');
  }
}

// إخفاء حالة الاتصال
function hideConnectionStatus() {
  const statusEl = document.getElementById('connectionStatus');
  if (statusEl) {
    statusEl.style.display = 'none';
  }
}

// عرض رسالة Toast
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

// تحديث الصفحة الحالية
function refreshCurrentPage() {
  const currentPage = localStorage.getItem('currentPage') || 'home';
  loadPage(currentPage);
}

// إضافة صفحات جديدة للتنقل
function addNewPages() {
  // إضافة صفحة المحادثات
  const chatLink = document.createElement('a');
  chatLink.href = '#';
  chatLink.dataset.page = 'chat';
  chatLink.innerHTML = '💬<span>المحادثات</span>';
  chatLink.addEventListener('click', e => {
    e.preventDefault();
    loadPage('chat');
  });
  
  // إضافة صفحة الإنجازات
  const achievementsLink = document.createElement('a');
  achievementsLink.href = '#';
  achievementsLink.dataset.page = 'achievements';
  achievementsLink.innerHTML = '🏆<span>الإنجازات</span>';
  achievementsLink.addEventListener('click', e => {
    e.preventDefault();
    loadPage('achievements');
  });
  
  // إضافة صفحة الخريطة
  const mapLink = document.createElement('a');
  mapLink.href = '#';
  mapLink.dataset.page = 'map';
  mapLink.innerHTML = '🗺️<span>الخريطة</span>';
  mapLink.addEventListener('click', e => {
    e.preventDefault();
    loadPage('map');
  });
  
  // إضافة الروابط لقائمة المزيد
  moreDropdown.appendChild(chatLink);
  moreDropdown.appendChild(achievementsLink);
  moreDropdown.appendChild(mapLink);
}

// تهيئة التطبيق
function initializeApp() {
  // إضافة الصفحات الجديدة
  addNewPages();
  
  // تحميل الصفحة المحفوظة أو الرئيسية
  const savedPage = localStorage.getItem('currentPage') || 'home';
  loadPage(savedPage);
  
  // فحص حالة الاتصال
  if (!navigator.onLine) {
    showConnectionStatus();
  }
  
  // تهيئة PWA Utils إذا كان متاحاً
  if (window.pwaUtils) {
    console.log('✅ PWA Utils جاهز');
  }
}

// تشغيل التطبيق عند التحميل
document.addEventListener('DOMContentLoaded', initializeApp);

// إضافة أنماط CSS للصفحات الجديدة
const additionalStyles = `
  .error-page {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--color-text);
  }
  
  .error-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  
  .error-page h2 {
    color: var(--color-primary);
    margin-bottom: 1rem;
  }
  
  .error-page p {
    margin-bottom: 2rem;
    color: #666;
  }
  
  .toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 1002;
    max-width: 300px;
  }
  
  .toast.show {
    transform: translateX(0);
  }
  
  .toast.toast-success {
    background: #4caf50;
  }
  
  .toast.toast-error {
    background: #f44336;
  }
  
  .toast.toast-warning {
    background: #ff9800;
  }
  
  .toast.toast-info {
    background: #2196f3;
  }
`;

// إضافة الأنماط للصفحة
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);