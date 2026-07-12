import * as TaskService from './services/TaskService.js';
import { applyFilters } from './utils/filters.js';
import { Modal } from './components/Modal.js';
import { TaskForm } from './components/TaskForm.js';
import { TaskList } from './components/TaskList.js';
import { Filters } from './components/Filters.js';
import { Search } from './components/Search.js';
import { Stats } from './components/Stats.js';
import { showToast } from './components/Toast.js';

// ─── Orden de prioridad para el sort ─────────────────────────────────────────
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

// ─── Estado de la vista ──────────────────────────────────────────────────────
const state = {
  tasks: [],
  filters: { status: 'all', priority: 'all', dateRange: 'all', search: '' },
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

// ─── Referencias a componentes ───────────────────────────────────────────────
let modal, taskList, filters, search, stats;

// ─── Ordenamiento ────────────────────────────────────────────────────────────

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    let cmp = 0;

    if (state.sortBy === 'priority') {
      cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    } else if (state.sortBy === 'dueDate') {
      if (!a.dueDate && !b.dueDate) cmp = 0;
      else if (!a.dueDate) cmp = 1;
      else if (!b.dueDate) cmp = -1;
      else cmp = new Date(a.dueDate) - new Date(b.dueDate);
    } else if (state.sortBy === 'title') {
      cmp = a.title.localeCompare(b.title, 'es');
    } else {
      // createdAt: más reciente primero por defecto
      cmp = new Date(b.createdAt) - new Date(a.createdAt);
      return cmp; // ya incluye orden descendente
    }

    return state.sortOrder === 'asc' ? cmp : -cmp;
  });
}

// ─── Ciclo de render ─────────────────────────────────────────────────────────

function refreshView() {
  const filtered = sortTasks(applyFilters(state.tasks, state.filters));
  const hasActiveFilters =
    filters.hasActiveFilters() || state.filters.search.trim().length > 0;

  taskList.render(filtered, hasActiveFilters);
  stats.render(state.tasks);
  updateTaskCount(filtered.length, state.tasks.length);
}

function updateTaskCount(shown, total) {
  const el = document.getElementById('taskCount');
  if (!el) return;
  if (shown === total) {
    el.textContent = `${total} tarea${total !== 1 ? 's' : ''}`;
  } else {
    el.textContent = `${shown} de ${total} tarea${total !== 1 ? 's' : ''}`;
  }
}

// ─── Handlers de tareas ──────────────────────────────────────────────────────

function openCreateForm() {
  const form = new TaskForm({
    onSubmit(data) {
      try {
        TaskService.add(data);
        state.tasks = TaskService.getAll();
        refreshView();
        modal.close();
        showToast('Tarea creada correctamente.');
      } catch (err) {
        showToast(err.message, 'error');
      }
    },
  });
  modal.open('Nueva tarea', form.element);
}

function openEditForm(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;

  const form = new TaskForm({
    task,
    onSubmit(data) {
      try {
        TaskService.update(id, data);
        state.tasks = TaskService.getAll();
        refreshView();
        modal.close();
        showToast('Tarea actualizada correctamente.');
      } catch (err) {
        showToast(err.message, 'error');
      }
    },
  });
  modal.open('Editar tarea', form.element);
}

function confirmDeleteTask(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;

  // Diálogo de confirmación inline en el modal
  const wrapper = document.createElement('div');
  wrapper.className = 'confirm-dialog';
  wrapper.innerHTML = `
    <p class="confirm-dialog__message">
      ¿Eliminar la tarea "<strong>${escapeHtml(task.title)}</strong>"?<br>
      <small>Esta acción no se puede deshacer.</small>
    </p>
    <div class="confirm-dialog__actions">
      <button class="btn btn-secondary" id="confirmCancel">Cancelar</button>
      <button class="btn btn-danger" id="confirmDelete">Eliminar</button>
    </div>`;

  modal.open('Confirmar eliminación', wrapper);

  wrapper.querySelector('#confirmCancel').addEventListener('click', () => modal.close());
  wrapper.querySelector('#confirmDelete').addEventListener('click', () => {
    try {
      TaskService.remove(id);
      state.tasks = TaskService.getAll();
      refreshView();
      modal.close();
      showToast('Tarea eliminada.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

function cycleTaskStatus(id, nextStatus) {
  try {
    TaskService.changeStatus(id, nextStatus);
    state.tasks = TaskService.getAll();
    refreshView();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ─── Sidebar responsive ──────────────────────────────────────────────────────

function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const openBtn = document.getElementById('menuToggle');
  const closeBtn = document.getElementById('sidebarClose');

  function openSidebar() {
    sidebar.classList.add('sidebar--open');
    overlay.classList.add('sidebar-overlay--visible');
  }

  function closeSidebar() {
    sidebar.classList.remove('sidebar--open');
    overlay.classList.remove('sidebar-overlay--visible');
  }

  openBtn?.addEventListener('click', openSidebar);
  closeBtn?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);
}

// ─── Sort controls ───────────────────────────────────────────────────────────

function initSortControls() {
  const container = document.getElementById('sortControls');
  if (!container) return;

  container.innerHTML = `
    <label class="sort-label" for="sortSelect">Ordenar:</label>
    <select class="form-input form-select sort-select" id="sortSelect">
      <option value="createdAt">Más recientes</option>
      <option value="priority">Prioridad</option>
      <option value="dueDate">Fecha límite</option>
      <option value="title">Nombre</option>
    </select>`;

  container.querySelector('#sortSelect').addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    refreshView();
  });
}

// ─── Escape HTML (usado en confirmación) ─────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Inicialización ──────────────────────────────────────────────────────────

function init() {
  // Cargar tareas desde almacenamiento
  state.tasks = TaskService.getAll();

  // Instanciar componentes
  modal = new Modal();

  taskList = new TaskList(document.getElementById('taskList'), {
    onEdit: openEditForm,
    onDelete: confirmDeleteTask,
    onCycleStatus: cycleTaskStatus,
  });

  filters = new Filters(
    {
      status: document.getElementById('statusFilters'),
      priority: document.getElementById('priorityFilters'),
      date: document.getElementById('dateFilters'),
    },
    (newFilters) => {
      state.filters = { ...state.filters, ...newFilters };
      refreshView();
    }
  );

  search = new Search(document.getElementById('searchContainer'), (query) => {
    state.filters = { ...state.filters, search: query };
    refreshView();
  });

  stats = new Stats(document.getElementById('statsSection'));

  // Botón nueva tarea
  document.getElementById('newTaskBtn')?.addEventListener('click', openCreateForm);

  // Sidebar responsive
  initSidebar();
  initSortControls();

  // Render inicial
  refreshView();
}

document.addEventListener('DOMContentLoaded', init);
