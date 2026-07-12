import {
  filterByStatus,
  filterByPriority,
  filterByDateRange,
  searchTasks,
  applyFilters,
} from '../js/utils/filters.js';

// Fecha de referencia: hoy, ayer, mañana, en 3 días
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

const todayStr = toDateStr(TODAY);

const yesterday = new Date(TODAY);
yesterday.setDate(TODAY.getDate() - 1);
const yesterdayStr = toDateStr(yesterday);

const tomorrow = new Date(TODAY);
tomorrow.setDate(TODAY.getDate() + 1);
const tomorrowStr = toDateStr(tomorrow);

const in5Days = new Date(TODAY);
in5Days.setDate(TODAY.getDate() + 5);
const in5DaysStr = toDateStr(in5Days);

const tasks = [
  { id: '1', title: 'Alpha', description: 'trabajo importante', status: 'pending', priority: 'high', dueDate: yesterdayStr },
  { id: '2', title: 'Beta', description: '', status: 'in-progress', priority: 'medium', dueDate: todayStr },
  { id: '3', title: 'Gamma', description: 'reunión', status: 'completed', priority: 'low', dueDate: yesterdayStr },
  { id: '4', title: 'Delta', description: '', status: 'pending', priority: 'medium', dueDate: tomorrowStr },
  { id: '5', title: 'Epsilon', description: '', status: 'pending', priority: 'low', dueDate: null },
  { id: '6', title: 'Zeta compras', description: '', status: 'pending', priority: 'high', dueDate: in5DaysStr },
];

describe('filterByStatus', () => {
  it("retorna todas las tareas con status 'all'", () => {
    expect(filterByStatus(tasks, 'all')).toHaveLength(tasks.length);
  });

  it('filtra correctamente por status pending', () => {
    const result = filterByStatus(tasks, 'pending');
    expect(result.every((t) => t.status === 'pending')).toBe(true);
    expect(result).toHaveLength(4);
  });

  it('retorna todas las tareas si status es undefined', () => {
    expect(filterByStatus(tasks, undefined)).toHaveLength(tasks.length);
  });

  it('retorna [] si ninguna tarea tiene ese status', () => {
    expect(filterByStatus(tasks, 'archivado')).toHaveLength(0);
  });

  it('no muta el array original', () => {
    const copy = [...tasks];
    filterByStatus(tasks, 'pending');
    expect(tasks).toEqual(copy);
  });
});

describe('filterByPriority', () => {
  it('filtra correctamente por prioridad high', () => {
    const result = filterByPriority(tasks, 'high');
    expect(result.every((t) => t.priority === 'high')).toBe(true);
    expect(result).toHaveLength(2);
  });

  it("retorna todas con priority 'all'", () => {
    expect(filterByPriority(tasks, 'all')).toHaveLength(tasks.length);
  });
});

describe('filterByDateRange', () => {
  it("retorna todas con range 'all'", () => {
    expect(filterByDateRange(tasks, 'all')).toHaveLength(tasks.length);
  });

  it("'overdue' excluye tareas completadas aunque estén vencidas", () => {
    const result = filterByDateRange(tasks, 'overdue');
    expect(result.some((t) => t.id === '3')).toBe(false); // completed
  });

  it("'overdue' incluye tareas no completadas con fecha pasada", () => {
    const result = filterByDateRange(tasks, 'overdue');
    expect(result.some((t) => t.id === '1')).toBe(true); // pending + ayer
  });

  it("'today' retorna tareas con vencimiento hoy", () => {
    const result = filterByDateRange(tasks, 'today');
    expect(result.every((t) => t.dueDate === todayStr)).toBe(true);
    expect(result).toHaveLength(1);
  });

  it("'week' retorna tareas con vencimiento en los próximos 7 días (incluyendo hoy)", () => {
    const result = filterByDateRange(tasks, 'week');
    // hoy (id:2), mañana (id:4), en5días (id:6)
    const ids = result.map((t) => t.id);
    expect(ids).toContain('2');
    expect(ids).toContain('4');
    expect(ids).toContain('6');
    // ayer no debe estar
    expect(ids).not.toContain('1');
  });

  it('excluye tareas sin dueDate de los filtros de fecha', () => {
    const result = filterByDateRange(tasks, 'overdue');
    expect(result.some((t) => t.id === '5')).toBe(false);
  });

  it('retorna [] si no hay tareas', () => {
    expect(filterByDateRange([], 'overdue')).toEqual([]);
  });
});

describe('searchTasks', () => {
  it('retorna todas las tareas con query vacío', () => {
    expect(searchTasks(tasks, '')).toHaveLength(tasks.length);
  });

  it('busca en el título (case-insensitive)', () => {
    const result = searchTasks(tasks, 'ALPHA');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('busca en la descripción', () => {
    const result = searchTasks(tasks, 'reunión');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('retorna [] si no hay coincidencias', () => {
    expect(searchTasks(tasks, 'xyz-no-existe')).toHaveLength(0);
  });

  it('retorna todas las tareas con query solo de espacios', () => {
    expect(searchTasks(tasks, '   ')).toHaveLength(tasks.length);
  });

  it('busca coincidencias parciales', () => {
    const result = searchTasks(tasks, 'compras');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('6');
  });
});

describe('applyFilters', () => {
  it('sin filtros retorna todas las tareas', () => {
    expect(applyFilters(tasks, {})).toHaveLength(tasks.length);
  });

  it('combina status + priority correctamente', () => {
    const result = applyFilters(tasks, { status: 'pending', priority: 'high' });
    expect(result.every((t) => t.status === 'pending' && t.priority === 'high')).toBe(true);
  });

  it('combina status + search', () => {
    const result = applyFilters(tasks, { status: 'pending', search: 'compras' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('6');
  });

  it('retorna [] si la combinación no tiene resultados', () => {
    const result = applyFilters(tasks, { status: 'completed', priority: 'high' });
    expect(result).toHaveLength(0);
  });

  it('maneja una lista vacía sin errores', () => {
    expect(applyFilters([], { status: 'pending', search: 'algo' })).toEqual([]);
  });
});
