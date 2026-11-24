import { z } from 'zod';
import { getBrowserStorage, type KeyValueStorage } from '../storage';

/**
 * Servicio de progreso compartido por todos los módulos.
 *
 * Todo vive en una sola clave versionada de localStorage:
 *   { version, updatedAt, modules: { [moduleId]: datosDelMódulo } }
 *
 * Cada módulo valida su propia porción con un esquema zod. Si los datos están
 * corruptos o son de una versión futura, se guarda una copia de respaldo y se
 * arranca de cero sin romper la app («restauración segura»).
 */

export const STORAGE_KEY = 'argos.progress';
export const BACKUP_KEY = 'argos.progress.backup';
export const CURRENT_VERSION = 1;

const envelopeSchema = z.object({
  version: z.number().int().positive(),
  updatedAt: z.string(),
  modules: z.record(z.string(), z.unknown()),
});
export type ProgressEnvelope = z.infer<typeof envelopeSchema>;

/** Migraciones de versión N a N+1. Agregar aquí cuando cambie el formato. */
type Migration = (old: ProgressEnvelope) => ProgressEnvelope;
const MIGRATIONS: Record<number, Migration> = {};

function emptyEnvelope(): ProgressEnvelope {
  return { version: CURRENT_VERSION, updatedAt: new Date(0).toISOString(), modules: {} };
}

export interface ProgressStore {
  readModule<T>(moduleId: string, schema: z.ZodType<T>, fallback: T): T;
  writeModule<T>(moduleId: string, value: T): void;
  resetModule(moduleId: string): void;
  resetAll(): void;
  subscribe(listener: () => void): () => void;
  /** Cambia en cada escritura; sirve como snapshot para useSyncExternalStore. */
  getRevision(): number;
}

export function createProgressStore(storage: KeyValueStorage = getBrowserStorage()): ProgressStore {
  const listeners = new Set<() => void>();
  let revision = 0;
  let envelope = load();
  const cache = new Map<string, { revision: number; value: unknown }>();

  function load(): ProgressEnvelope {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return emptyEnvelope();
    try {
      let parsed = envelopeSchema.parse(JSON.parse(raw));
      if (parsed.version > CURRENT_VERSION) throw new Error('Versión futura');
      while (parsed.version < CURRENT_VERSION) {
        const migrate = MIGRATIONS[parsed.version];
        if (!migrate) throw new Error(`Sin migración desde v${parsed.version}`);
        parsed = migrate(parsed);
      }
      return parsed;
    } catch {
      try {
        storage.setItem(BACKUP_KEY, raw);
      } catch {
        // Sin espacio para el respaldo: se continúa igual.
      }
      return emptyEnvelope();
    }
  }

  function persist() {
    envelope = { ...envelope, version: CURRENT_VERSION, updatedAt: new Date().toISOString() };
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    } catch {
      // Si no se puede guardar, el progreso sigue en memoria durante la sesión.
    }
    revision += 1;
    cache.clear();
    listeners.forEach((l) => l());
  }

  return {
    readModule<T>(moduleId: string, schema: z.ZodType<T>, fallback: T): T {
      const hit = cache.get(moduleId);
      if (hit && hit.revision === revision) return hit.value as T;
      const result = schema.safeParse(envelope.modules[moduleId]);
      const value = result.success ? result.data : fallback;
      cache.set(moduleId, { revision, value });
      return value;
    },
    writeModule(moduleId, value) {
      envelope = { ...envelope, modules: { ...envelope.modules, [moduleId]: value } };
      persist();
    },
    resetModule(moduleId) {
      const modules = { ...envelope.modules };
      delete modules[moduleId];
      envelope = { ...envelope, modules };
      persist();
    },
    resetAll() {
      envelope = emptyEnvelope();
      persist();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getRevision: () => revision,
  };
}
