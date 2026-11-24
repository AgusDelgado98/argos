/**
 * Fase 3 — Centro Blue Team. Solo contratos: registros 100 % sintéticos.
 * Nada de capturar tráfico real ni monitorear equipos del usuario.
 */
export type Severity = 'info' | 'baja' | 'media' | 'alta' | 'critica';

export interface SyntheticLogEntry {
  id: string;
  /** Hora simulada (texto), no un reloj real. */
  time: string;
  source: 'correo' | 'endpoint' | 'red' | 'identidad';
  message: string;
  severity: Severity;
  /** Verdad de base para corregir el ejercicio. */
  truth: 'malicioso' | 'benigno' | 'falso_positivo';
}

export interface IncidentReport {
  title: string;
  summary: string;
  iocs: string[];
  priority: Severity;
  actions: string[];
}
