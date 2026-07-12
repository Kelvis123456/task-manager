import { renderTaskCard } from './TaskCard.js';

export class TaskList {
  constructor(container, { onEdit, onDelete, onCycleStatus }) {
    this.container = container;
    this.onEdit = onEdit;
    this.onDelete = onDelete;
    this.onCycleStatus = onCycleStatus;

    // Event delegation: un solo listener maneja todos los clicks de las tarjetas
    this.container.addEventListener('click', (e) => this._handleClick(e));
  }

  render(tasks, hasActiveFilters = false) {
    if (tasks.length === 0) {
      this.container.innerHTML = this._emptyStateHtml(hasActiveFilters);
      return;
    }
    this.container.innerHTML = `
      <ul class="task-list" role="list">
        ${tasks.map((t) => `<li>${renderTaskCard(t)}</li>`).join('')}
      </ul>`;
  }

  _handleClick(e) {
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;

    const { action, id, nextStatus } = actionEl.dataset;

    if (action === 'edit') this.onEdit(id);
    if (action === 'delete') this.onDelete(id);
    if (action === 'cycle-status') this.onCycleStatus(id, nextStatus);
  }

  _emptyStateHtml(hasActiveFilters) {
    if (hasActiveFilters) {
      return `
        <div class="empty-state">
          <div class="empty-state__icon">🔍</div>
          <h3 class="empty-state__title">Sin resultados</h3>
          <p class="empty-state__desc">Ninguna tarea coincide con los filtros actuales.</p>
        </div>`;
    }
    return `
      <div class="empty-state">
        <div class="empty-state__icon">✅</div>
        <h3 class="empty-state__title">Sin tareas por el momento</h3>
        <p class="empty-state__desc">Crea tu primera tarea haciendo click en "Nueva Tarea".</p>
      </div>`;
  }
}
