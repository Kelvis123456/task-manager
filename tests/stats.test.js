import { computeStats } from '../js/utils/stats.js';

function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const yesterday = new Date(TODAY);
yesterday.setDate(TODAY.getDate() - 1);

const tomorrow = new Date(TODAY);
tomorrow.setDate(TODAY.getDate() + 1);

function makeTask(overrides) {
  return {
    id: 'id-' + Math.random(),
    title: 'Test',
    status: 'pending',
    priority: 'medium',
    dueDate: null,
    ...overrides,
  };
}

describe('computeStats', () => {
  it('retorna ceros para un array vacÃ­o', () => {
    const stats = computeStats([]);
    expect(stats.total).toBe(0);
    expect(stats.completed).toBe(0);
    expect(stats.completionRate).toBe(0);
    expect(stats.overdue).toBe(0);
    expect(stats.highPriorityPending).toBe(0);
  });

  it('cuenta correctamente los totales por estado', () => {
    const tasks = [
      makeTask({ status: 'pending' }),
      makeTask({ status: 'pending' }),
      makeTask({ status: 'in-progress' }),
      makeTask({ status: 'completed' }),
    ];
    const stats = computeStats(tasks);
    expect(stats.total).toBe(4);
    expect(stats.pending).toBe(2);
    expect(stats.inProgress).toBe(1);
    expect(stats.completed).toBe(1);
  });

  it('calcula completionRate como porcentaje redondeado', () => {
    const tasks = [
      makeTask({ status: 'completed' }),
      makeTask({ status: 'completed' }),
      makeTask({ status: 'pending' }),
    ];
    const stats = computeStats(tasks);
    expect(stats.completionRate).toBe(67); // 2/3 = 66.6... â†’ 67
  });

  it('completionRate es 100 cuando todas estÃ¡n completadas', () => {
    const tasks = [makeTask({ status: 'completed' }), makeTask({ status: 'completed' })];
    expect(computeStats(tasks).completionRate).toBe(100);
  });

  it('completionRate es 0 cuando ninguna estÃ¡ completada', () => {
    const tasks = [makeTask({ status: 'pending' }), makeTask({ status: 'in-progress' })];
    expect(computeStats(tasks).completionRate).toBe(0);
  });

  it('cuenta como vencida una tarea no completada con dueDate en el pasado', () => {
    const tasks = [makeTask({ status: 'pending', dueDate: toDateStr(yesterday) })];
    expect(computeStats(tasks).overdue).toBe(1);
  });

  it('NO cuenta como vencida una tarea completada aunque su fecha sea pasada', () => {
    const tasks = [makeTask({ status: 'completed', dueDate: toDateStr(yesterday) })];
    expect(computeStats(tasks).overdue).toBe(0);
  });

  it('NO cuenta como vencida una tarea sin dueDate', () => {
    const tasks = [makeTask({ status: 'pending', dueDate: null })];
    expect(computeStats(tasks).overdue).toBe(0);
  });

  it('NO cuenta como vencida una tarea con dueDate en el futuro', () => {
    const tasks = [makeTask({ status: 'pending', dueDate: toDateStr(tomorrow) })];
    expect(computeStats(tasks).overdue).toBe(0);
  });

  it('cuenta highPriorityPending solo para tareas no completadas de alta prioridad', () => {
    const tasks = [
      makeTask({ priority: 'high', status: 'pending' }),
      makeTask({ priority: 'high', status: 'in-progress' }),
      makeTask({ priority: 'high', status: 'completed' }), // no debe contar
      makeTask({ priority: 'medium', status: 'pending' }), // no debe contar
    ];
    expect(computeStats(tasks).highPriorityPending).toBe(2);
  });
});

