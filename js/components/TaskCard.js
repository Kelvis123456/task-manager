import { formatDate, isOverdue, isDueToday } from '../utils/date.js';

const STATUS_LABELS = {
  pending: 'Pendiente',
  'in-progress': 'En progreso',
  completed: 'Completada',
};

const STATUS_NEXT = {
  pending: 'in-progress',
  'in-progress': 'completed',
  completed: 'pending',
};

const PRIORITY_LABELS = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

// Escapa HTML para prevenir XSS en contenido generado por el usuario
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function dueDateHtml(dueDate, status) {
  if (!dueDate) return '';
  const formatted = formatDate(dueDate);
  const overdue = isOverdue(dueDate, status);
  const today = isDueToday(dueDate);
  let cls = 'task-card__due';
  if (overdue) cls += ' task-card__due--overdue';
  else if (today) cls += ' task-card__due--today';
  const icon = overdue ? '⚠' : '📅';
  return `<span class="${cls}">${icon} ${esc(formatted)}</span>`;
}

function tagsHtml(tags) {
  if (!tags?.length) return '';
  return `<div class="task-card__tags">${tags
    .map((tag) => `<span class="task-tag">${esc(tag)}</span>`)
    .join('')}</div>`;
}

export function renderTaskCard(task) {
  const { id, title, description, priority, status, dueDate, tags } = task;
  const nextStatus = STATUS_NEXT[status];
  const completedClass = status === 'completed' ? ' task-card--completed' : '';

  return `
    <article class="task-card task-card--${esc(priority)}${completedClass}" data-id="${esc(id)}">
      <div class="task-card__priority-bar" aria-hidden="true"></div>
      <div class="task-card__body">
        <div class="task-card__header">
          <h3 class="task-card__title">${esc(title)}</h3>
          <div class="task-card__actions">
            <button
              class="btn-icon"
              data-action="edit"
              data-id="${esc(id)}"
              title="Editar tarea"
              aria-label="Editar ${esc(title)}"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button
              class="btn-icon btn-icon--danger"
              data-action="delete"
              data-id="${esc(id)}"
              title="Eliminar tarea"
              aria-label="Eliminar ${esc(title)}"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        </div>

        ${description ? `<p class="task-card__description">${esc(description)}</p>` : ''}
        ${tagsHtml(tags)}

        <div class="task-card__footer">
          ${dueDateHtml(dueDate, status)}
          <div class="task-card__badges">
            <span class="badge badge--priority badge--${esc(priority)}">${PRIORITY_LABELS[priority]}</span>
            <button
              class="badge badge--status badge--${esc(status)}"
              data-action="cycle-status"
              data-id="${esc(id)}"
              data-next-status="${esc(nextStatus)}"
              title="Cambiar a ${STATUS_LABELS[nextStatus]}"
              aria-label="Estado: ${STATUS_LABELS[status]}. Click para cambiar a ${STATUS_LABELS[nextStatus]}"
            >${STATUS_LABELS[status]}</button>
          </div>
        </div>
      </div>
    </article>`;
}
