import type { ComponentType, LazyExoticComponent } from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * Contrato de un módulo de ARGOS. Agregar un módulo nuevo = sumar una entrada
 * en `registry.ts`. El router, la landing, el hub de casos y la página de
 * próximos módulos se generan a partir de este registro.
 */
export type ModuleStatus = 'available' | 'planned';

export type PracticeArea = 'detectar' | 'proteger' | 'entender' | 'actuar' | 'ia';

export interface ModuleDefinition {
  id: string;
  /** Segmento de URL: /casos/<slug> */
  slug: string;
  area: PracticeArea;
  title: string;
  /** Título corto para tarjetas («Detectar engaños»). */
  cardTitle: string;
  cardDescription: string;
  description: string;
  icon: LucideIcon;
  status: ModuleStatus;
  /** Fase de la hoja de ruta en la que se planifica. */
  phase: number;
  /** Qué se va a practicar (se muestra en «Próximos módulos»). */
  topics: string[];
  /** Compromiso de seguridad específico del módulo. */
  safety: string;
  /** Solo módulos disponibles: componente de la vista (carga diferida). */
  component?: LazyExoticComponent<ComponentType>;
  /** Cantidad de ejercicios, si aplica. */
  exerciseCount?: number;
}
