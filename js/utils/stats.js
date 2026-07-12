/**
 * Todas las funciones de estadísticas son puras: no tienen efectos secundarios
 * y dependen solo de sus argumentos, por lo que son triviales de testear.
 */

export function computeStats(tasks) {
  const total = tasks.length;

  if (total === 0) {
    return {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      completionRate: 0,
      overdue: 0,
      highPriorityPending: 0,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pending = tasks.filter((t) => t.status === 'pending').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const completionRate = Math.round((completed / total) * 100);

  const overdue = tasks.filter((t) => {
    if (!t.dueDate || t.status === 'completed') return false;
    const due = new Date(t.dueDate + 'T00:00:00');
    due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  const highPriorityPending = tasks.filter(
    (t) => t.priority === 'high' && t.status !== 'completed'
  ).length;

  return { total, pending, inProgress, completed, completionRate, overdue, highPriorityPending };
}
