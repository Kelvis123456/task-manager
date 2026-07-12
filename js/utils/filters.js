/**
 * Cada función de filtro recibe un array de tareas y un criterio,
 * y retorna un nuevo array sin mutar el original.
 * Esto las hace fácilmente testeables y componibles.
 */

export function filterByStatus(tasks, status) {
  if (!status || status === 'all') return tasks;
  return tasks.filter((t) => t.status === status);
}

export function filterByPriority(tasks, priority) {
  if (!priority || priority === 'all') return tasks;
  return tasks.filter((t) => t.priority === priority);
}

export function filterByDateRange(tasks, range) {
  if (!range || range === 'all') return tasks;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks.filter((t) => {
    if (!t.dueDate) return false;

    // Añadir T00:00:00 para evitar shifts de zona horaria al parsear YYYY-MM-DD
    const due = new Date(t.dueDate + 'T00:00:00');
    due.setHours(0, 0, 0, 0);

    switch (range) {
      case 'overdue':
        return due < today && t.status !== 'completed';

      case 'today':
        return due.getTime() === today.getTime();

      case 'week': {
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        return due >= today && due <= weekEnd;
      }

      default:
        return true;
    }
  });
}

export function searchTasks(tasks, query) {
  if (!query || query.trim() === '') return tasks;
  const normalized = query.trim().toLowerCase();
  return tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(normalized) ||
      t.description.toLowerCase().includes(normalized)
  );
}

/**
 * Aplica todos los filtros en cadena. El orden importa:
 * primero los filtros discretos (rápidos), luego la búsqueda de texto.
 */
export function applyFilters(tasks, { status, priority, dateRange, search } = {}) {
  let result = tasks;
  result = filterByStatus(result, status);
  result = filterByPriority(result, priority);
  result = filterByDateRange(result, dateRange);
  result = searchTasks(result, search);
  return result;
}
