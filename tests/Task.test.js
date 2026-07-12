import { createTask, updateTask } from '../js/models/Task.js';

describe('createTask', () => {
  it('genera un id único para cada tarea', () => {
    const a = createTask({ title: 'Tarea A' });
    const b = createTask({ title: 'Tarea B' });
    expect(a.id).toBeDefined();
    expect(b.id).toBeDefined();
    expect(a.id).not.toBe(b.id);
  });

  it('aplica valores por defecto cuando no se pasan campos opcionales', () => {
    const task = createTask({ title: 'Mínima' });
    expect(task.priority).toBe('medium');
    expect(task.status).toBe('pending');
    expect(task.description).toBe('');
    expect(task.dueDate).toBeNull();
    expect(task.tags).toEqual([]);
  });

  it('aplica trim al título y la descripción', () => {
    const task = createTask({ title: '  Título con espacios  ', description: '  Desc  ' });
    expect(task.title).toBe('Título con espacios');
    expect(task.description).toBe('Desc');
  });

  it('establece createdAt y updatedAt como timestamps ISO válidos', () => {
    const before = new Date().toISOString();
    const task = createTask({ title: 'Test' });
    const after = new Date().toISOString();
    expect(task.createdAt >= before).toBe(true);
    expect(task.createdAt <= after).toBe(true);
    expect(task.createdAt).toBe(task.updatedAt);
  });

  it('copia el array de tags sin referenciar el original', () => {
    const tags = ['urgente', 'trabajo'];
    const task = createTask({ title: 'Test', tags });
    tags.push('extra');
    expect(task.tags).toEqual(['urgente', 'trabajo']);
  });

  it('asigna dueDate como null cuando se pasa una cadena vacía', () => {
    const task = createTask({ title: 'Test', dueDate: '' });
    expect(task.dueDate).toBeNull();
  });
});

describe('updateTask', () => {
  const base = createTask({ title: 'Original', priority: 'low' });

  it('retorna un nuevo objeto sin mutar el original', () => {
    const updated = updateTask(base, { title: 'Modificado' });
    expect(updated).not.toBe(base);
    expect(base.title).toBe('Original');
    expect(updated.title).toBe('Modificado');
  });

  it('nunca sobreescribe el id original', () => {
    const updated = updateTask(base, { id: 'id-fraudulento' });
    expect(updated.id).toBe(base.id);
  });

  it('nunca sobreescribe createdAt', () => {
    const updated = updateTask(base, { createdAt: '2000-01-01T00:00:00.000Z' });
    expect(updated.createdAt).toBe(base.createdAt);
  });

  it('actualiza updatedAt a un timestamp más reciente que createdAt', () => {
    // Pequeño delay para garantizar que updatedAt sea diferente
    const updated = updateTask(base, { title: 'Nuevo' });
    expect(updated.updatedAt >= base.createdAt).toBe(true);
  });

  it('combina el resto de campos correctamente', () => {
    const updated = updateTask(base, { priority: 'high', status: 'in-progress' });
    expect(updated.priority).toBe('high');
    expect(updated.status).toBe('in-progress');
    expect(updated.title).toBe('Original');
  });
});
