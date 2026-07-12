export const VALID_PRIORITIES = ['low', 'medium', 'high'];
export const VALID_STATUSES = ['pending', 'in-progress', 'completed'];
export const MAX_TITLE_LENGTH = 120;
export const MAX_DESC_LENGTH = 500;
export const MAX_TAGS = 10;

/**
 * Valida los campos de entrada para crear o actualizar una tarea.
 * Retorna un array de mensajes de error. Array vacío = input válido.
 */
export function validateTaskInput({ title, priority, status, dueDate, description, tags } = {}) {
  const errors = [];

  // Título: requerido, no vacío, longitud máxima
  if (title === undefined || title === null) {
    errors.push('El título es requerido.');
  } else if (typeof title !== 'string' || title.trim().length === 0) {
    errors.push('El título no puede estar vacío.');
  } else if (title.trim().length > MAX_TITLE_LENGTH) {
    errors.push(`El título no puede superar ${MAX_TITLE_LENGTH} caracteres.`);
  }

  // Prioridad: solo si está presente
  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`La prioridad debe ser: ${VALID_PRIORITIES.join(', ')}.`);
  }

  // Estado: solo si está presente
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(`El estado debe ser: ${VALID_STATUSES.join(', ')}.`);
  }

  // Descripción: longitud máxima
  if (description !== undefined && description.length > MAX_DESC_LENGTH) {
    errors.push(`La descripción no puede superar ${MAX_DESC_LENGTH} caracteres.`);
  }

  // Fecha: si está presente debe ser parseable y no ser una cadena inválida
  if (dueDate !== undefined && dueDate !== null && dueDate !== '') {
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) {
      errors.push('La fecha de vencimiento no es válida.');
    }
  }

  // Tags: si está presente debe ser un array y no exceder el límite
  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      errors.push('Las etiquetas deben ser un array.');
    } else if (tags.length > MAX_TAGS) {
      errors.push(`No se pueden agregar más de ${MAX_TAGS} etiquetas.`);
    }
  }

  return errors;
}
