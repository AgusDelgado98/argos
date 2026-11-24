import { useCallback, useContext, useSyncExternalStore } from 'react';
import type { z } from 'zod';
import { ProgressContext } from '../lib/progress/context';
import type { ProgressStore } from '../lib/progress/store';

export function useProgressStore(): ProgressStore {
  const store = useContext(ProgressContext);
  if (!store) throw new Error('useProgressStore debe usarse dentro de <ProgressProvider>.');
  return store;
}

/**
 * Lee y escribe la porción de progreso de un módulo, con validación y
 * suscripción a cambios.
 */
export function useModuleProgress<T>(moduleId: string, schema: z.ZodType<T>, fallback: T) {
  const store = useProgressStore();
  useSyncExternalStore(store.subscribe, store.getRevision, store.getRevision);
  const value = store.readModule(moduleId, schema, fallback);

  const update = useCallback(
    (updater: (current: T) => T) => {
      store.writeModule(moduleId, updater(store.readModule(moduleId, schema, fallback)));
    },
    [store, moduleId, schema, fallback],
  );
  const reset = useCallback(() => store.resetModule(moduleId), [store, moduleId]);

  return [value, update, reset] as const;
}
