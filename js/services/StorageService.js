export const STORAGE_KEY = 'taskmanager_v1_tasks';

/**
 * Lee tareas desde localStorage.
 * Si el JSON está corrupto o el valor no es un array, retorna [] en lugar de lanzar.
 * Esto protege la app si el usuario modifica localStorage manualmente.
 */
export function getTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persiste el array de tareas en localStorage.
 * Retorna true en éxito, false si falla (ej: QuotaExceededError).
 */
export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('[StorageService] El almacenamiento local está lleno.');
    } else {
      console.error('[StorageService] Error al guardar:', error);
    }
    return false;
  }
}

/**
 * Elimina todas las tareas del almacenamiento.
 */
export function clearTasks() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
