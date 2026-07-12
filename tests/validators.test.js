import { validateTaskInput, MAX_TITLE_LENGTH, MAX_DESC_LENGTH, MAX_TAGS } from '../js/utils/validators.js';

function valid(overrides = {}) {
  return { title: 'Tarea válida', priority: 'medium', status: 'pending', ...overrides };
}

describe('validateTaskInput', () => {
  it('no retorna errores para un input mínimo válido', () => {
    expect(validateTaskInput({ title: 'Test' })).toEqual([]);
  });

  it('no retorna errores para un input completo válido', () => {
    const errors = validateTaskInput({
      title: 'Tarea completa',
      description: 'Una descripción.',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2030-12-31',
      tags: ['trabajo'],
    });
    expect(errors).toEqual([]);
  });

  // Título
  it('exige título cuando está ausente', () => {
    const errors = validateTaskInput({});
    expect(errors.some((e) => e.includes('requerido'))).toBe(true);
  });

  it('rechaza título vacío (solo espacios)', () => {
    const errors = validateTaskInput({ title: '   ' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it(`rechaza título mayor a ${MAX_TITLE_LENGTH} caracteres`, () => {
    const errors = validateTaskInput({ title: 'a'.repeat(MAX_TITLE_LENGTH + 1) });
    expect(errors.some((e) => e.includes(`${MAX_TITLE_LENGTH}`))).toBe(true);
  });

  it(`acepta título de exactamente ${MAX_TITLE_LENGTH} caracteres`, () => {
    expect(validateTaskInput({ title: 'a'.repeat(MAX_TITLE_LENGTH) })).toEqual([]);
  });

  // Prioridad
  it('rechaza una prioridad no permitida', () => {
    const errors = validateTaskInput({ title: 'Test', priority: 'extreme' });
    expect(errors.some((e) => e.includes('prioridad'))).toBe(true);
  });

  it('acepta priority undefined sin error', () => {
    expect(validateTaskInput({ title: 'Test', priority: undefined })).toEqual([]);
  });

  // Estado
  it('rechaza un estado no permitido', () => {
    const errors = validateTaskInput({ title: 'Test', status: 'archivado' });
    expect(errors.some((e) => e.includes('estado'))).toBe(true);
  });

  // Descripción
  it(`rechaza descripción mayor a ${MAX_DESC_LENGTH} caracteres`, () => {
    const errors = validateTaskInput({ title: 'T', description: 'x'.repeat(MAX_DESC_LENGTH + 1) });
    expect(errors.some((e) => e.includes(`${MAX_DESC_LENGTH}`))).toBe(true);
  });

  // Fecha
  it('acepta dueDate null sin error', () => {
    expect(validateTaskInput({ title: 'Test', dueDate: null })).toEqual([]);
  });

  it('acepta dueDate como cadena vacía sin error', () => {
    expect(validateTaskInput({ title: 'Test', dueDate: '' })).toEqual([]);
  });

  it('rechaza una fecha con formato inválido', () => {
    const errors = validateTaskInput({ title: 'Test', dueDate: 'no-es-fecha' });
    expect(errors.some((e) => e.includes('fecha'))).toBe(true);
  });

  it('acepta una fecha válida en formato YYYY-MM-DD', () => {
    expect(validateTaskInput({ title: 'Test', dueDate: '2030-06-15' })).toEqual([]);
  });

  // Tags
  it('rechaza tags cuando no es un array', () => {
    const errors = validateTaskInput({ title: 'Test', tags: 'etiqueta' });
    expect(errors.some((e) => e.includes('etiquetas'))).toBe(true);
  });

  it(`rechaza más de ${MAX_TAGS} tags`, () => {
    const tags = Array.from({ length: MAX_TAGS + 1 }, (_, i) => `tag${i}`);
    const errors = validateTaskInput({ title: 'Test', tags });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('puede retornar múltiples errores al mismo tiempo', () => {
    const errors = validateTaskInput({ title: '', priority: 'malo', status: 'malo' });
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});
