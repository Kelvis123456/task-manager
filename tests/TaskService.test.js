import * as TaskService from '../js/services/TaskService.js';
import { clearTasks } from '../js/services/StorageService.js';

beforeEach(() => {
  localStorage.clear();
});

describe('TaskService.add', () => {
  it('crea una tarea con los campos correctos y la persiste', () => {
    const task = TaskService.add({ title: 'Nueva tarea', priority: 'high' });
    expect(task.title).toBe('Nueva tarea');
    expect(task.priority).toBe('high');
    expect(task.id).toBeDefined();
    expect(TaskService.getAll()).toHaveLength(1);
  });

  it('lanza si el título está vacío', () => {
    expect(() => TaskService.add({ title: '' })).toThrow();
  });

  it('lanza si el título excede 120 caracteres', () => {
    const longTitle = 'a'.repeat(121);
    expect(() => TaskService.add({ title: longTitle })).toThrow();
  });

  it('lanza si se pasa una prioridad inválida', () => {
    expect(() => TaskService.add({ title: 'Test', priority: 'ultra' })).toThrow();
  });

  it('genera IDs únicos para múltiples tareas', () => {
    const t1 = TaskService.add({ title: 'T1' });
    const t2 = TaskService.add({ title: 'T2' });
    expect(t1.id).not.toBe(t2.id);
  });

  it('acumula tareas en el almacenamiento sin borrar las anteriores', () => {
    TaskService.add({ title: 'T1' });
    TaskService.add({ title: 'T2' });
    expect(TaskService.getAll()).toHaveLength(2);
  });
});

describe('TaskService.update', () => {
  it('actualiza el título de una tarea existente', () => {
    const task = TaskService.add({ title: 'Original' });
    const updated = TaskService.update(task.id, { title: 'Modificado' });
    expect(updated.title).toBe('Modificado');
    expect(TaskService.getAll().find((t) => t.id === task.id).title).toBe('Modificado');
  });

  it('lanza si el id no existe', () => {
    expect(() => TaskService.update('id-inexistente', { title: 'X' })).toThrow();
  });

  it('no permite actualizar el título a uno vacío', () => {
    const task = TaskService.add({ title: 'Original' });
    expect(() => TaskService.update(task.id, { title: '' })).toThrow();
  });

  it('no modifica otras tareas al actualizar una', () => {
    const t1 = TaskService.add({ title: 'T1' });
    const t2 = TaskService.add({ title: 'T2' });
    TaskService.update(t1.id, { title: 'T1 modificado' });
    const all = TaskService.getAll();
    expect(all.find((t) => t.id === t2.id).title).toBe('T2');
  });
});

describe('TaskService.remove', () => {
  it('elimina la tarea correcta y retorna true', () => {
    const task = TaskService.add({ title: 'Eliminar' });
    const result = TaskService.remove(task.id);
    expect(result).toBe(true);
    expect(TaskService.getAll()).toHaveLength(0);
  });

  it('lanza si el id no existe', () => {
    expect(() => TaskService.remove('id-inexistente')).toThrow();
  });

  it('puede eliminar la única tarea sin dejar el almacenamiento roto', () => {
    const task = TaskService.add({ title: 'Solo una' });
    TaskService.remove(task.id);
    expect(TaskService.getAll()).toEqual([]);
  });

  it('solo elimina la tarea con el id indicado', () => {
    const t1 = TaskService.add({ title: 'T1' });
    const t2 = TaskService.add({ title: 'T2' });
    TaskService.remove(t1.id);
    const remaining = TaskService.getAll();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(t2.id);
  });
});

describe('TaskService.changeStatus', () => {
  it('cambia el estado de la tarea', () => {
    const task = TaskService.add({ title: 'Test' });
    const updated = TaskService.changeStatus(task.id, 'completed');
    expect(updated.status).toBe('completed');
  });

  it('lanza si el estado es inválido', () => {
    const task = TaskService.add({ title: 'Test' });
    expect(() => TaskService.changeStatus(task.id, 'unknown')).toThrow();
  });

  it('lanza si la tarea no existe', () => {
    expect(() => TaskService.changeStatus('no-existe', 'completed')).toThrow();
  });
});
