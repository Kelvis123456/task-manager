const STATUS_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'in-progress', label: 'En progreso' },
  { value: 'completed', label: 'Completada' },
];

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'high', label: '🔴 Alta' },
  { value: 'medium', label: '🟡 Media' },
  { value: 'low', label: '🟢 Baja' },
];

const DATE_OPTIONS = [
  { value: 'all', label: 'Cualquier fecha' },
  { value: 'overdue', label: '⚠ Vencidas' },
  { value: 'today', label: '📅 Hoy' },
  { value: 'week', label: '📆 Esta semana' },
];

export class Filters {
  /**
   * @param {Object} containers - { status, priority, date } → elementos DOM
   * @param {Function} onChange - Recibe { status, priority, dateRange }
   */
  constructor(containers, onChange) {
    this.containers = containers;
    this.onChange = onChange;
    this.active = { status: 'all', priority: 'all', dateRange: 'all' };

    this._renderGroup(containers.status, STATUS_OPTIONS, 'status');
    this._renderGroup(containers.priority, PRIORITY_OPTIONS, 'priority');
    this._renderGroup(containers.date, DATE_OPTIONS, 'dateRange');
  }

  reset() {
    this.active = { status: 'all', priority: 'all', dateRange: 'all' };
    this._refreshActiveClasses();
  }

  getValues() {
    return { ...this.active };
  }

  hasActiveFilters() {
    return (
      this.active.status !== 'all' ||
      this.active.priority !== 'all' ||
      this.active.dateRange !== 'all'
    );
  }

  _renderGroup(container, options, filterKey) {
    container.innerHTML = '';
    options.forEach(({ value, label }) => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.filter = filterKey;
      btn.dataset.value = value;
      btn.textContent = label;
      if (this.active[filterKey] === value) btn.classList.add('filter-btn--active');
      btn.addEventListener('click', () => {
        this.active[filterKey] = value;
        this._refreshActiveClasses();
        this.onChange(this.getValues());
      });
      container.appendChild(btn);
    });
  }

  _refreshActiveClasses() {
    const allBtns = Object.values(this.containers).flatMap((c) =>
      Array.from(c.querySelectorAll('.filter-btn'))
    );
    allBtns.forEach((btn) => {
      const key = btn.dataset.filter;
      const isActive = this.active[key] === btn.dataset.value;
      btn.classList.toggle('filter-btn--active', isActive);
    });
  }
}
