const DEBOUNCE_MS = 300;

export class Search {
  /**
   * @param {HTMLElement} container - Donde se inyecta el input de búsqueda
   * @param {Function} onChange - Recibe el string de búsqueda
   */
  constructor(container, onChange) {
    this.onChange = onChange;
    this._timer = null;
    this.element = this._build();
    container.appendChild(this.element);
  }

  getValue() {
    return this.element.querySelector('input').value;
  }

  clear() {
    const input = this.element.querySelector('input');
    input.value = '';
    this.onChange('');
  }

  _build() {
    const wrapper = document.createElement('div');
    wrapper.className = 'search-box';
    wrapper.innerHTML = `
      <svg class="search-box__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        class="search-box__input"
        type="search"
        placeholder="Buscar tareas..."
        aria-label="Buscar tareas"
        autocomplete="off"
      />
      <button class="search-box__clear" aria-label="Limpiar búsqueda" hidden>×</button>`;

    const input = wrapper.querySelector('input');
    const clearBtn = wrapper.querySelector('.search-box__clear');

    input.addEventListener('input', () => {
      clearBtn.hidden = input.value.length === 0;
      clearTimeout(this._timer);
      this._timer = setTimeout(() => this.onChange(input.value), DEBOUNCE_MS);
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.hidden = true;
      this.onChange('');
      input.focus();
    });

    return wrapper;
  }
}
