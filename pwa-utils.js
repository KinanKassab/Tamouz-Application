// أدوات PWA المساعدة
class PWAUtils {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.swRegistration = null;
    this.init();
  }

  // تهيئة PWA
  async init() {
    this.checkInstallation();
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupNotifications();
    this.setupBackgroundSync();
    this.monitorConnection();
  }

  // فحص حالة التثبيت
  checkInstallation() {
    // فحص إذا كان التطبيق مثبت
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      this.isInstalled = true;
      document.body.classList.add('pwa-installed');
      console.log('✅ التطبيق مثبت كـ PWA');
    }

    // مراقبة تغيير حالة التثبيت
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      console.log('✅ تم تثبيت التطبيق');
      this.showInstallSuccess();
    });
  }

  // تسجيل Service Worker
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('✅ تم تسجيل Service Worker بنجاح');

        // مراقبة التحديثات
        this.swRegistration.addEventListener('updatefound', () => {
          const newWorker = this.swRegistration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateAvailable();
            }
          });
        });

      } catch (error) {
        console.error('❌ فشل تسجيل Service Worker:', error);
      }
    }
  }

  // إعداد مطالبة التثبيت
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });
  }

  // عرض زر التثبيت
  showInstallButton() {
    const installBtn = document.getElementById('installBtn');
    if (installBtn && !this.isInstalled) {
      installBtn.style.display = 'block';
      installBtn.addEventListener('click', () => this.promptInstall());
    }
  }

  // مطالبة التثبيت
  async promptInstall() {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ المستخدم وافق على التثبيت');
    } else {
      console.log('❌ المستخدم رفض التثبيت');
    }
    
    this.deferredPrompt = null;
  }

  // إعداد الإشعارات
  async setupNotifications() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('✅ تم منح إذن الإشعارات');
        this.subscribeToNotifications();
      }
    }
  }

  // الاشتراك في الإشعارات
  async subscribeToNotifications() {
    try {
      if (!this.swRegistration) return;

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY')
      });

      console.log('✅ تم الاشتراك في الإشعارات');
      // إرسال الاشتراك للخادم
      await this.sendSubscriptionToServer(subscription);
      
    } catch (error) {
      console.error('❌ فشل الاشتراك في الإشعارات:', error);
    }
  }

  // إرسال الاشتراك للخادم
  async sendSubscriptionToServer(subscription) {
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('❌ فشل إرسال الاشتراك:', error);
    }
  }

  // إعداد المزامنة في الخلفية
  setupBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        return registration.sync.register('background-sync');
      });
    }
  }

  // مراقبة حالة الاتصال
  monitorConnection() {
    const updateOnlineStatus = () => {
      const statusEl = document.getElementById('connectionStatus');
      
      if (navigator.onLine) {
        document.body.classList.remove('offline');
        document.body.classList.add('online');
        if (statusEl) statusEl.style.display = 'none';
      } else {
        document.body.classList.remove('online');
        document.body.classList.add('offline');
        if (statusEl) statusEl.style.display = 'block';
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
  }

  // عرض رسالة نجاح التثبيت
  showInstallSuccess() {
    this.showToast('🎉 تم تثبيت التطبيق بنجاح!', 'success');
  }

  // عرض رسالة توفر تحديث
  showUpdateAvailable() {
    const updateBanner = document.createElement('div');
    updateBanner.className = 'update-banner';
    updateBanner.innerHTML = `
      <div class="update-content">
        <span>🔄 يتوفر تحديث جديد للتطبيق</span>
        <button onclick="pwaUtils.applyUpdate()" class="update-btn">تحديث</button>
        <button onclick="this.parentElement.parentElement.remove()" class="dismiss-btn">×</button>
      </div>
    `;
    
    document.body.appendChild(updateBanner);
  }

  // تطبيق التحديث
  applyUpdate() {
    if (this.swRegistration && this.swRegistration.waiting) {
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  // عرض رسالة Toast
  showToast(message, type = 'info') {
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

  // حفظ البيانات محلياً
  saveOfflineData(key, data) {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('❌ فشل حفظ البيانات:', error);
    }
  }

  // استرجاع البيانات المحفوظة
  getOfflineData(key) {
    try {
      const stored = localStorage.getItem(`offline_${key}`);
      if (stored) {
        const { data, timestamp } = JSON.parse(stored);
        // فحص إذا كانت البيانات قديمة (أكثر من 24 ساعة)
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return data;
        }
      }
    } catch (error) {
      console.error('❌ فشل استرجاع البيانات:', error);
    }
    return null;
  }

  // تحويل VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // فحص دعم الميزات
  checkFeatureSupport() {
    const features = {
      serviceWorker: 'serviceWorker' in navigator,
      notifications: 'Notification' in window,
      pushManager: 'PushManager' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      indexedDB: 'indexedDB' in window,
      webShare: 'share' in navigator
    };

    console.log('🔍 دعم ميزات PWA:', features);
    return features;
  }
}

// تهيئة PWA Utils
const pwaUtils = new PWAUtils();

// تصدير للاستخدام العام
window.pwaUtils = pwaUtils;