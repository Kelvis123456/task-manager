// Pub/sub mínimo para desacoplar componentes sin dependencias externas.
// Los componentes emiten eventos; app.js suscribe y orquesta la lógica.

const _listeners = new Map();

function on(event, callback) {
  if (!_listeners.has(event)) _listeners.set(event, []);
  _listeners.get(event).push(callback);
  // Retorna función de desuscripción para evitar memory leaks
  return () => off(event, callback);
}

function off(event, callback) {
  if (!_listeners.has(event)) return;
  _listeners.set(
    event,
    _listeners.get(event).filter((cb) => cb !== callback)
  );
}

function emit(event, data) {
  (_listeners.get(event) ?? []).forEach((cb) => cb(data));
}

function clear() {
  _listeners.clear();
}

export const eventBus = { on, off, emit, clear };
