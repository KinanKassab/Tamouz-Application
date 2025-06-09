import { StateManager } from './StateManager';
import { ToastOptions, ModalOptions } from '../types';

export class UIManager {
  private stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  init(): void {
    this.setupGlobalEventListeners();
    this.setupThemeToggle();
  }

  showToast(message: string, options: ToastOptions = { type: 'info' }): void {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${options.type}`;
    
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-message">${message}</span>
        ${options.action ? `<button class="toast-action">${options.action.label}</button>` : ''}
        <button class="toast-close" aria-label="إغلاق">
          <i data-lucide="x"></i>
        </button>
      </div>
    `;

    // Add event listeners
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn?.addEventListener('click', () => this.removeToast(toast));

    const actionBtn = toast.querySelector('.toast-action');
    if (actionBtn && options.action) {
      actionBtn.addEventListener('click', () => {
        options.action!.handler();
        this.removeToast(toast);
      });
    }

    container.appendChild(toast);

    // Auto remove after duration
    const duration = options.duration || 5000;
    setTimeout(() => this.removeToast(toast), duration);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });
  }

  showModal(options: ModalOptions): void {
    const container = document.getElementById('modal-container');
    const overlay = document.getElementById('overlay');
    if (!container || !overlay) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${options.title}</h3>
          <button class="modal-close" aria-label="إغلاق">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-body">
          ${options.content}
        </div>
        ${options.type === 'confirm' ? `
          <div class="modal-footer">
            <button class="btn btn-secondary modal-cancel">إلغاء</button>
            <button class="btn btn-primary modal-confirm">تأكيد</button>
          </div>
        ` : ''}
      </div>
    `;

    // Add event listeners
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.modal-cancel');
    const confirmBtn = modal.querySelector('.modal-confirm');

    const closeModal = () => {
      modal.classList.remove('modal-show');
      overlay.classList.remove('overlay-show');
      setTimeout(() => {
        container.removeChild(modal);
      }, 300);
    };

    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', () => {
      options.onCancel?.();
      closeModal();
    });
    confirmBtn?.addEventListener('click', () => {
      options.onConfirm?.();
      closeModal();
    });

    overlay.addEventListener('click', closeModal);

    container.appendChild(modal);
    overlay.classList.add('overlay-show');
    
    requestAnimationFrame(() => {
      modal.classList.add('modal-show');
    });
  }

  private removeToast(toast: HTMLElement): void {
    toast.classList.remove('toast-show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  private setupGlobalEventListeners(): void {
    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Close modals and overlays
        const overlay = document.getElementById('overlay');
        if (overlay?.classList.contains('overlay-show')) {
          overlay.click();
        }
      }
    });
  }

  private setupThemeToggle(): void {
    // Listen for theme changes
    this.stateManager.subscribe('theme', (state) => {
      document.documentElement.setAttribute('data-theme', state.theme);
    });
  }
}