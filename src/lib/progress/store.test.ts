import { z } from 'zod';
import { BACKUP_KEY, STORAGE_KEY, createProgressStore } from './store';
import { createMemoryStorage } from '../storage';

const schema = z.object({ count: z.number() });
const fallback = { count: 0 };

describe('almacén de progreso', () => {
  it('guarda y restaura entre instancias (persistencia)', () => {
    const storage = createMemoryStorage();
    const a = createProgressStore(storage);
    a.writeModule('demo', { count: 3 });
    const b = createProgressStore(storage);
    expect(b.readModule('demo', schema, fallback)).toEqual({ count: 3 });
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!).version).toBe(1);
  });

  it('datos corruptos: respalda y arranca de cero sin romper', () => {
    const storage = createMemoryStorage();
    storage.setItem(STORAGE_KEY, '{esto no es json');
    const store = createProgressStore(storage);
    expect(store.readModule('demo', schema, fallback)).toEqual(fallback);
    expect(storage.getItem(BACKUP_KEY)).toBe('{esto no es json');
  });

  it('versión futura desconocida: no se interpreta', () => {
    const storage = createMemoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 99, updatedAt: '', modules: { demo: { count: 5 } } }));
    expect(createProgressStore(storage).readModule('demo', schema, fallback)).toEqual(fallback);
  });

  it('porción de módulo inválida usa el valor por defecto', () => {
    const storage = createMemoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, updatedAt: '', modules: { demo: { count: 'x' } } }));
    expect(createProgressStore(storage).readModule('demo', schema, fallback)).toEqual(fallback);
  });

  it('reset de módulo y reset total', () => {
    const storage = createMemoryStorage();
    const store = createProgressStore(storage);
    store.writeModule('a', { count: 1 });
    store.writeModule('b', { count: 2 });
    store.resetModule('a');
    expect(store.readModule('a', schema, fallback)).toEqual(fallback);
    expect(store.readModule('b', schema, fallback)).toEqual({ count: 2 });
    store.resetAll();
    expect(store.readModule('b', schema, fallback)).toEqual(fallback);
  });

  it('notifica a los suscriptores y devuelve snapshots estables', () => {
    const store = createProgressStore(createMemoryStorage());
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    const first = store.readModule('a', schema, fallback);
    expect(store.readModule('a', schema, fallback)).toBe(first);
    store.writeModule('a', { count: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    store.writeModule('a', { count: 2 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('si el almacenamiento falla al escribir, sigue en memoria', () => {
    const storage = createMemoryStorage();
    storage.setItem = () => {
      throw new Error('QuotaExceeded');
    };
    const store = createProgressStore(storage);
    store.writeModule('a', { count: 7 });
    expect(store.readModule('a', schema, fallback)).toEqual({ count: 7 });
  });
});
