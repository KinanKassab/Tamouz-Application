import { Workbox } from 'workbox-window';

export class PWAManager {
  private wb: Workbox | null = null;

  static init(): void {
    const manager = new PWAManager();
    manager.initServiceWorker();
    manager.setupInstallPrompt();
    manager.setupUpdatePrompt();
  }

  private initServiceWorker(): void {
    if ('serviceWorker' in navigator) {
      this.wb = new Workbox('/sw.js');
      
      this.wb.addEventListener('installed', (event) => {
        if (event.isUpdate) {
          // Show update available notification
          this.showUpdateNotification();
        }
      });

      this.wb.register().catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    }
  }

  private setupInstallPrompt(): void {
    let deferredPrompt: any;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install button
      this.showInstallButton(deferredPrompt);
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      deferredPrompt = null;
    });
  }

  private setupUpdatePrompt(): void {
    if (this.wb) {
      this.wb.addEventListener('waiting', () => {
        this.showUpdateNotification();
      });
    }
  }

  private showInstallButton(deferredPrompt: any): void {
    // Create install button
    const installBtn = document.createElement('button');
    installBtn.className = 'install-btn';
    installBtn.innerHTML = `
      <i data-lucide="download"></i>
      تثبيت التطبيق
    `;
    
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        
        deferredPrompt = null;
        installBtn.remove();
      }
    });

    // Add to header or appropriate location
    document.body.appendChild(installBtn);
  }

  private showUpdateNotification(): void {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="update-content">
        <span>تحديث جديد متاح</span>
        <button class="btn btn-primary update-btn">تحديث</button>
        <button class="btn btn-secondary dismiss-btn">لاحقاً</button>
      </div>
    `;

    const updateBtn = notification.querySelector('.update-btn');
    const dismissBtn = notification.querySelector('.dismiss-btn');

    updateBtn?.addEventListener('click', () => {
      if (this.wb) {
        this.wb.messageSkipWaiting();
        window.location.reload();
      }
    });

    dismissBtn?.addEventListener('click', () => {
      notification.remove();
    });

    document.body.appendChild(notification);
  }
}