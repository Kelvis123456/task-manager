import { getTasks, saveTasks, clearTasks, STORAGE_KEY } from '../js/services/StorageService.js';

// jsdom provee localStorage, pero lo espiamos para controlar comportamientos de error
beforeEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

describe('getTasks', () => {
  it('retorna [] cuando localStorage está vacío', () => {
    expect(getTasks()).toEqual([]);
  });

  it('retorna el array guardado cuando el JSON es válido', () => {
    const tasks = [{ id: '1', title: 'Tarea 1' }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    expect(getTasks()).toEqual(tasks);
  });

  it('retorna [] cuando el JSON está corrupto (no lanza)', () => {
    localStorage.setItem(STORAGE_KEY, '{ corrupto: ');
    expect(() => getTasks()).not.toThrow();
    expect(getTasks()).toEqual([]);
  });

  it('retorna [] cuando el valor guardado no es un array (ej: objeto)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: '1' }));
    expect(getTasks()).toEqual([]);
  });

  it('retorna [] cuando el valor guardado es null', () => {
    localStorage.setItem(STORAGE_KEY, 'null');
    expect(getTasks()).toEqual([]);
  });
});

describe('saveTasks', () => {
  it('persiste el array y retorna true', () => {
    const tasks = [{ id: '1', title: 'Test' }];
    const result = saveTasks(tasks);
    expect(result).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual(tasks);
  });

  it('retorna false y no lanza cuando ocurre QuotaExceededError', () => {
    const error = new DOMException('Quota exceeded', 'QuotaExceededError');
    jest.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw error;
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = saveTasks([{ id: '1', title: 'Test' }]);
    expect(result).toBe(false);
    consoleSpy.mockRestore();
  });

  it('retorna false cuando setItem lanza cualquier error inesperado', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('Unexpected');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = saveTasks([]);
    expect(result).toBe(false);
    consoleSpy.mockRestore();
  });
});

describe('clearTasks', () => {
  it('elimina la clave del almacenamiento y retorna true', () => {
    saveTasks([{ id: '1', title: 'Test' }]);
    const result = clearTasks();
    expect(result).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('retorna true aunque la clave no existiera', () => {
    expect(clearTasks()).toBe(true);
  });
});
