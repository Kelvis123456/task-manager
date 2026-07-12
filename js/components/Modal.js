export class Modal {
  constructor() {
    this._overlay = document.getElementById('modalOverlay');
    this._titleEl = document.getElementById('modalTitle');
    this._bodyEl = document.getElementById('modalBody');
    this._closeBtn = document.getElementById('modalClose');
    this._onClose = null;

    this._bindEvents();
  }

  open(title, contentEl, onClose = null) {
    this._titleEl.textContent = title;
    this._bodyEl.innerHTML = '';
    this._bodyEl.appendChild(contentEl);
    this._onClose = onClose;

    this._overlay.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    // Mueve el foco al primer elemento interactivo del modal
    const firstFocusable = this._overlay.querySelector(
      'input, select, textarea, button:not([disabled])'
    );
    firstFocusable?.focus();
  }

  close() {
    this._overlay.setAttribute('hidden', '');
    this._bodyEl.innerHTML = '';
    document.body.style.overflow = '';
    this._onClose?.();
    this._onClose = null;
  }

  _bindEvents() {
    this._closeBtn.addEventListener('click', () => this.close());

    // Cerrar al hacer click fuera del modal
    this._overlay.addEventListener('click', (e) => {
      if (e.target === this._overlay) this.close();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this._overlay.hasAttribute('hidden')) {
        this.close();
      }
    });
  }
}
