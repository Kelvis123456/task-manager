import { createTask, updateTask } from '../models/Task.js';
import { getTasks, saveTasks } from './StorageService.js';
import { validateTaskInput } from '../utils/validators.js';

function assertValidInput(input) {
  const errors = validateTaskInput(input);
  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }
}

function assertTaskExists(tasks, id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) throw new Error(`Tarea con id "${id}" no encontrada.`);
  return task;
}

export function getAll() {
  return getTasks();
}

export function add(input) {
  assertValidInput(input);
  const task = createTask(input);
  const tasks = getTasks();
  saveTasks([...tasks, task]);
  return task;
}

export function update(id, changes) {
  const tasks = getTasks();
  const existing = assertTaskExists(tasks, id);

  // Siempre validamos el estado fusionado: evita que cambios parciales
  // (ej: status inválido via changeStatus) pasen sin validación.
  const merged = { ...existing, ...changes };
  assertValidInput(merged);

  const updated = updateTask(existing, changes);
  saveTasks(tasks.map((t) => (t.id === id ? updated : t)));
  return updated;
}

export function remove(id) {
  const tasks = getTasks();
  assertTaskExists(tasks, id);
  saveTasks(tasks.filter((t) => t.id !== id));
  return true;
}

export function changeStatus(id, status) {
  return update(id, { status });
}
