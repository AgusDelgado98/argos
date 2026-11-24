import { lazy } from 'react';
import { Bug, BrainCircuit, KeyRound, MailWarning, Siren } from 'lucide-react';
import type { ModuleDefinition } from './types';
import { LAB_SAFETY_NOTICE } from '../labs/contracts';

export const MODULES: readonly ModuleDefinition[] = [
  {
    id: 'phishing',
    slug: 'phishing',
    area: 'detectar',
    title: 'Detectar engaños — Phishing',
    cardTitle: 'Detectar engaños',
    cardDescription: 'Identificá correos y mensajes fraudulentos (phishing).',
    description:
      'Una bandeja de correo ficticia con 12 casos: mensajes legítimos, intentos de phishing y otros que requieren verificar antes de actuar.',
    icon: MailWarning,
    status: 'available',
    phase: 1,
    topics: ['Remitente y dominio', 'Urgencia y presión', 'Enlaces y adjuntos', 'Verificación por otro canal'],
    safety: 'Todos los correos, marcas, personas y dominios son inventados. Los enlaces son texto inerte.',
    component: lazy(() => import('../phishing/PhishingSimulator')),
    exerciseCount: 12,
  },
  {
    id: 'accesos',
    slug: 'accesos',
    area: 'proteger',
    title: 'Proteger tus accesos',
    cardTitle: 'Proteger tus accesos',
    cardDescription: 'Fortalecé tus contraseñas y cuentas.',
    description:
      'Contraseñas robustas, gestores de contraseñas, verificación en dos pasos y qué pasa cuando un sitio no limita los intentos de ingreso, con un login de juguete local.',
    icon: KeyRound,
    status: 'planned',
    phase: 2,
    topics: ['Frases de contraseña', 'Verificación en dos pasos', 'Fuerza bruta sobre un login simulado con límite de intentos'],
    safety: 'Nunca se prueban contraseñas contra servicios reales ni se piden tus claves.',
  },
  {
    id: 'amenazas',
    slug: 'amenazas',
    area: 'entender',
    title: 'Entender las amenazas — Laboratorio Worm / Malware',
    cardTitle: 'Entender las amenazas',
    cardDescription: 'Conocé cómo actúan los malware más comunes.',
    description:
      'Tres equipos ficticios (Recepción, Administración y Servidor de archivos) en una red virtual. Un motor de simulación produce eventos sintéticos para ver cómo se propaga un worm y practicar aislar, examinar, bloquear y restaurar.',
    icon: Bug,
    status: 'planned',
    phase: 2,
    topics: ['Virus, worm y troyano', 'Indicadores de compromiso', 'Límites del antivirus y del EDR', 'Modos Observación y Defensa'],
    safety: `${LAB_SAFETY_NOTICE} Las «copias» son objetos en memoria: no se tocan archivos ni redes.`,
  },
  {
    id: 'incidentes',
    slug: 'incidentes',
    area: 'actuar',
    title: 'Actuar ante un incidente — Centro Blue Team',
    cardTitle: 'Actuar ante un incidente',
    cardDescription: 'Qué hacer si tu cuenta o dispositivo está en riesgo.',
    description:
      'Una consola educativa con líneas de tiempo y registros totalmente sintéticos para identificar indicadores, separar falsos positivos, priorizar y documentar incidentes.',
    icon: Siren,
    status: 'planned',
    phase: 3,
    topics: ['Líneas de tiempo', 'IOC y falsos positivos', 'Priorización', 'Documentar un incidente'],
    safety: `${LAB_SAFETY_NOTICE} No se captura tráfico real ni se monitorea tu equipo.`,
  },
  {
    id: 'ia',
    slug: 'ia',
    area: 'ia',
    title: 'IA y seguridad',
    cardTitle: 'IA aplicada a la detección',
    cardDescription: 'Cómo ayuda la IA a detectar amenazas y cuáles son sus límites.',
    description:
      'Detección de anomalías con datos públicos o sintéticos, métricas reales (matriz de confusión, precisión, recall, F1) y un laboratorio de prompt injection con documentos y un asistente ficticios.',
    icon: BrainCircuit,
    status: 'planned',
    phase: 4,
    topics: ['Anomalías y falsos positivos', 'Métricas y data leakage', 'Asistente educativo determinista', 'Prompt injection en un recinto simulado'],
    safety: `${LAB_SAFETY_NOTICE} Sin APIs pagas ni envío de tus datos a terceros.`,
  },
];

export const availableModules = MODULES.filter((m) => m.status === 'available');
export const plannedModules = MODULES.filter((m) => m.status === 'planned');

export function getModule(slug: string): ModuleDefinition | undefined {
  return MODULES.find((m) => m.slug === slug);
}

/** Las cuatro áreas de la landing, en el orden de la referencia visual. */
export const LANDING_AREAS = ['detectar', 'proteger', 'entender', 'actuar'] as const;
