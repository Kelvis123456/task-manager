import { VALID_PRIORITIES, VALID_STATUSES } from '../utils/validators.js';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in-progress', label: 'En progreso' },
  { value: 'completed', label: 'Completada' },
];

function selectOptions(options, selected) {
  return options
    .map(
      (o) =>
        `<option value="${o.value}" ${o.value === selected ? 'selected' : ''}>${o.label}</option>`
    )
    .join('');
}

export class TaskForm {
  /**
   * @param {Object} opts
   * @param {Function} opts.onSubmit - Recibe los datos del formulario
   * @param {Object|null} opts.task - Tarea existente para modo edición
   */
  constructor({ onSubmit, task = null }) {
    this.onSubmit = onSubmit;
    this.task = task;
    this.element = this._build();
  }

  _build() {
    const isEdit = !!this.task;
    const t = this.task ?? {};

    const form = document.createElement('form');
    form.id = 'taskForm';
    form.noValidate = true;
    form.innerHTML = `
      <div class="form-group">
        <label class="form-label" for="taskTitle">
          Título <span class="form-required" aria-hidden="true">*</span>
        </label>
        <input
          class="form-input"
          id="taskTitle"
          name="title"
          type="text"
          placeholder="¿Qué hay que hacer?"
          maxlength="120"
          required
          autocomplete="off"
          value="${this._esc(t.title ?? '')}"
        />
        <span class="form-error" id="titleError" role="alert" hidden></span>
      </div>

      <div class="form-group">
        <label class="form-label" for="taskDescription">Descripción</label>
        <textarea
          class="form-input form-textarea"
          id="taskDescription"
          name="description"
          placeholder="Detalles opcionales..."
          maxlength="500"
          rows="3"
        >${this._esc(t.description ?? '')}</textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="taskPriority">Prioridad</label>
          <select class="form-input form-select" id="taskPriority" name="priority">
            ${selectOptions(PRIORITY_OPTIONS, t.priority ?? 'medium')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="taskStatus">Estado</label>
          <select class="form-input form-select" id="taskStatus" name="status">
            ${selectOptions(STATUS_OPTIONS, t.status ?? 'pending')}
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="taskDueDate">Fecha límite</label>
        <input
          class="form-input"
          id="taskDueDate"
          name="dueDate"
          type="date"
          value="${this._esc(t.dueDate ?? '')}"
        />
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary btn-full">
          ${isEdit ? 'Guardar cambios' : 'Crear tarea'}
        </button>
      </div>`;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this._validate(form)) {
        this.onSubmit(this._getData(form));
      }
    });

    // Validación en tiempo real al salir del campo de título
    form.querySelector('#taskTitle').addEventListener('blur', () => {
      this._validateTitle(form);
    });

    return form;
  }

  _validate(form) {
    return this._validateTitle(form);
  }

  _validateTitle(form) {
    const titleInput = form.querySelector('#taskTitle');
    const errorEl = form.querySelector('#titleError');
    const value = titleInput.value.trim();

    if (!value) {
      this._showError(titleInput, errorEl, 'El título es requerido.');
      return false;
    }
    if (value.length > 120) {
      this._showError(titleInput, errorEl, 'El título no puede superar 120 caracteres.');
      return false;
    }
    this._clearError(titleInput, errorEl);
    return true;
  }

  _showError(input, errorEl, message) {
    input.classList.add('form-input--error');
    errorEl.textContent = message;
    errorEl.removeAttribute('hidden');
  }

  _clearError(input, errorEl) {
    input.classList.remove('form-input--error');
    errorEl.setAttribute('hidden', '');
  }

  _getData(form) {
    const data = new FormData(form);
    return {
      title: data.get('title').trim(),
      description: data.get('description').trim(),
      priority: data.get('priority'),
      status: data.get('status'),
      dueDate: data.get('dueDate') || null,
    };
  }

  _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
