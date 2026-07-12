function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback para entornos sin crypto.randomUUID (ej: Node <14.17)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function createTask({
  title,
  description = '',
  priority = 'medium',
  status = 'pending',
  dueDate = null,
  tags = [],
} = {}) {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: title.trim(),
    description: description.trim(),
    priority,
    status,
    dueDate: dueDate || null,
    tags: Array.isArray(tags) ? [...tags] : [],
    createdAt: now,
    updatedAt: now,
  };
}

// Devuelve un nuevo objeto sin mutar el original.
// Protege id y createdAt para que nunca sean sobreescritos.
function updateTask(task, changes) {
  return {
    ...task,
    ...changes,
    id: task.id,
    createdAt: task.createdAt,
    updatedAt: new Date().toISOString(),
  };
}

export { createTask, updateTask, generateId };
