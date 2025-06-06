const contentEl = document.getElementById('content');
const navLinks = document.querySelectorAll('nav a[data-page]');
const moreBtn = document.querySelector('button.more-btn');
const moreDropdown = document.querySelector('.more-dropdown');
const darkModeToggle = document.getElementById('darkModeToggle');

// تحميل الصفحة المطلوبة من ملف HTML داخل مجلد pages
async function loadPage(page) {
  try {
    const response = await fetch(`pages/${page}.html`);
    if (!response.ok) throw new Error('404');
    const html = await response.text();
    contentEl.innerHTML = html;
  } catch (err) {
    contentEl.innerHTML = '<p>الصفحة غير موجودة 😢</p>';
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
}

// روابط التنقل العادية
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    loadPage(link.dataset.page);
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
});

// إغلاق القائمة لو ضغطت براها
document.addEventListener('click', () => {
  moreDropdown.style.display = 'none';
  moreBtn.setAttribute('aria-expanded', 'false');
});

// تفعيل الوضع الداكن المحفوظ
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark');
}

// تبديل الوضع الداكن
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  if (document.body.classList.contains('dark')) {
    localStorage.setItem('darkMode', 'enabled');
  } else {
    localStorage.removeItem('darkMode');
  }
});

// تحميل الصفحة الرئيسية
loadPage('home');
