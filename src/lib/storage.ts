/**
 * Acceso defensivo a localStorage. Si el navegador lo bloquea (modo privado,
 * cuotas, políticas), la app sigue funcionando en memoria.
 */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

class MemoryStorage implements KeyValueStorage {
  private data = new Map<string, string>();
  getItem(key: string) {
    return this.data.has(key) ? (this.data.get(key) as string) : null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
}

export function getBrowserStorage(): KeyValueStorage {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const probe = '__argos_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return window.localStorage;
    }
  } catch {
    // localStorage no disponible: se usa memoria.
  }
  return new MemoryStorage();
}

export function createMemoryStorage(): KeyValueStorage {
  return new MemoryStorage();
}
