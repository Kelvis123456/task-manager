import { computeStats } from '../utils/stats.js';

export class Stats {
  constructor(container) {
    this.container = container;
  }

  render(tasks) {
    const s = computeStats(tasks);
    this.container.innerHTML = `
      <div class="stats-grid">
        ${this._card('Total', s.total, 'stat--total', '📋')}
        ${this._card('Completadas', `${s.completed} (${s.completionRate}%)`, 'stat--completed', '✅')}
        ${this._card('En progreso', s.inProgress, 'stat--in-progress', '🔄')}
        ${this._card('Vencidas', s.overdue, s.overdue > 0 ? 'stat--overdue stat--alert' : 'stat--overdue', '⚠')}
        ${this._card('Alta prioridad', s.highPriorityPending, s.highPriorityPending > 0 ? 'stat--high stat--alert' : 'stat--high', '🔴')}
      </div>`;
  }

  _card(label, value, cls, icon) {
    return `
      <div class="stat-card ${cls}">
        <span class="stat-card__icon" aria-hidden="true">${icon}</span>
        <div class="stat-card__content">
          <span class="stat-card__value">${value}</span>
          <span class="stat-card__label">${label}</span>
        </div>
      </div>`;
  }
}
