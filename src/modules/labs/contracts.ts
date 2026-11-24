/**
 * Contratos para los laboratorios futuros (Fase 2+).
 *
 * IMPORTANTE: esto son SOLO tipos y constantes. Los laboratorios simulan
 * estados con objetos de JavaScript en memoria y eventos de UI. Nunca:
 * duplicar archivos reales, acceder al sistema de archivos, escanear redes,
 * propagar código, ejecutar muestras ni construir replicación ejecutable.
 */

export const LAB_SAFETY_NOTICE = 'Simulación ficticia. No afecta tus archivos, redes ni cuentas.';

/** Fase 2 — Laboratorio Worm / Malware */
export type VirtualHostId = string;

export type VirtualHostState = 'sano' | 'sospechoso' | 'comprometido' | 'aislado' | 'restaurado';

export interface VirtualHost {
  id: VirtualHostId;
  /** Ej.: «Recepción», «Administración», «Servidor de archivos». */
  label: string;
  state: VirtualHostState;
  /** Archivos representados como texto; jamás contenido ejecutable. */
  virtualFiles: { name: string; flagged: boolean }[];
}

export interface VirtualNetwork {
  hosts: VirtualHost[];
  links: { from: VirtualHostId; to: VirtualHostId }[];
}

export type SimulationEvent =
  | { type: 'archivo_aparece'; tick: number; host: VirtualHostId; fileName: string }
  | { type: 'equipo_alerta'; tick: number; host: VirtualHostId; reason: string }
  | { type: 'aislamiento'; tick: number; host: VirtualHostId }
  | { type: 'cuarentena'; tick: number; host: VirtualHostId; fileName: string };

export type DefensiveAction = 'aislar' | 'examinar' | 'bloquear' | 'restaurar';

export type LabMode = 'observacion' | 'defensa';

/** Motor puro y determinista (misma semilla ⇒ mismos eventos). */
export interface SimulationEngine {
  readonly seed: number;
  init(network: VirtualNetwork): VirtualNetwork;
  step(network: VirtualNetwork, tick: number): { network: VirtualNetwork; events: SimulationEvent[] };
  apply(network: VirtualNetwork, action: DefensiveAction, host: VirtualHostId): VirtualNetwork;
}

/** Cada evento importante se vincula con una ficha de teoría. */
export interface TheoryLink {
  eventType: SimulationEvent['type'];
  conceptId: string;
}
