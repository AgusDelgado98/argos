import { z } from 'zod';
import { classificationSchema, type Scenario } from './schema';
import { evaluateDecision, type Decision, type Outcome } from './evaluate';

/** Progreso del módulo de phishing (porción "phishing" del almacén compartido). */

export const MODES = ['learn', 'challenge'] as const;
export type Mode = (typeof MODES)[number];

export const MODE_LABELS: Record<Mode, string> = { learn: 'Aprender', challenge: 'Desafío' };

const caseRecordSchema = z.object({
  visited: z.boolean().default(false),
  hintsRevealed: z.number().int().min(0).max(3).default(0),
  decision: classificationSchema.optional(),
  outcome: z.enum(['correct', 'cautious', 'risky']).optional(),
  answeredAt: z.string().optional(),
});
export type CaseRecord = z.infer<typeof caseRecordSchema>;

/**
 * Repaso guiado de las respuestas riesgosas del Desafío, en modo Aprender.
 * Solo usa registros de Aprender: las respuestas y el puntaje del Desafío no cambian.
 */
export const reviewSchema = z.object({
  caseIds: z.array(z.string()).min(1),
  done: z.array(z.string()).default([]),
  active: z.boolean().default(false),
  startedAt: z.string().optional(),
});
export type ReviewState = z.infer<typeof reviewSchema>;

export const phishingProgressSchema = z.object({
  mode: z.enum(MODES).default('learn'),
  currentCaseId: z.string().nullable().default(null),
  byMode: z
    .object({
      learn: z.record(z.string(), caseRecordSchema).default({}),
      challenge: z.record(z.string(), caseRecordSchema).default({}),
    })
    .default({ learn: {}, challenge: {} }),
  review: reviewSchema.nullable().default(null).catch(null),
});
export type PhishingProgress = z.infer<typeof phishingProgressSchema>;

export const INITIAL_PROGRESS: PhishingProgress = Object.freeze({
  mode: 'learn',
  currentCaseId: null,
  byMode: { learn: {}, challenge: {} },
  review: null,
}) as PhishingProgress;

const EMPTY_RECORD: CaseRecord = { visited: false, hintsRevealed: 0 };

export function getRecord(progress: PhishingProgress, caseId: string, mode: Mode = progress.mode): CaseRecord {
  return progress.byMode[mode][caseId] ?? EMPTY_RECORD;
}

function patchRecord(progress: PhishingProgress, caseId: string, patch: Partial<CaseRecord>, mode: Mode = progress.mode): PhishingProgress {
  const current = getRecord(progress, caseId, mode);
  return {
    ...progress,
    byMode: { ...progress.byMode, [mode]: { ...progress.byMode[mode], [caseId]: { ...current, ...patch } } },
  };
}

export function selectCase(progress: PhishingProgress, caseId: string): PhishingProgress {
  return patchRecord({ ...progress, currentCaseId: caseId }, caseId, { visited: true });
}

export function setMode(progress: PhishingProgress, mode: Mode): PhishingProgress {
  const next = { ...progress, mode };
  return next.currentCaseId ? patchRecord(next, next.currentCaseId, { visited: true }, mode) : next;
}

/** Las pistas solo existen en Aprender y nunca superan las del caso (máx. 3). */
export function revealNextHint(progress: PhishingProgress, scenario: Scenario): PhishingProgress {
  if (progress.mode !== 'learn') return progress;
  const record = getRecord(progress, scenario.id);
  const max = Math.min(3, scenario.hints.length);
  if (record.hintsRevealed >= max) return progress;
  return patchRecord(progress, scenario.id, { hintsRevealed: record.hintsRevealed + 1, visited: true });
}

export function answerCase(progress: PhishingProgress, scenario: Scenario, decision: Decision, now = new Date()): PhishingProgress {
  const record = getRecord(progress, scenario.id);
  if (record.decision) return progress; // la respuesta queda fija; en Aprender se puede reintentar explícitamente
  return patchRecord(progress, scenario.id, {
    visited: true,
    decision,
    outcome: evaluateDecision(scenario, decision),
    answeredAt: now.toISOString(),
  });
}

/** Solo en Aprender: borra la respuesta del caso (conserva las pistas vistas). */
export function retryCase(progress: PhishingProgress, caseId: string): PhishingProgress {
  if (progress.mode !== 'learn') return progress;
  const record = getRecord(progress, caseId);
  return {
    ...progress,
    byMode: {
      ...progress.byMode,
      learn: { ...progress.byMode.learn, [caseId]: { visited: true, hintsRevealed: record.hintsRevealed } },
    },
  };
}

export interface ModeStats {
  total: number;
  visited: number;
  answered: number;
  correct: number;
  cautious: number;
  risky: number;
}

export function computeStats(progress: PhishingProgress, scenarioIds: readonly string[], mode: Mode = progress.mode): ModeStats {
  const stats: ModeStats = { total: scenarioIds.length, visited: 0, answered: 0, correct: 0, cautious: 0, risky: 0 };
  for (const id of scenarioIds) {
    const r = progress.byMode[mode][id];
    if (!r) continue;
    if (r.visited) stats.visited += 1;
    if (r.decision && r.outcome) {
      stats.answered += 1;
      stats[r.outcome as Outcome] += 1;
    }
  }
  return stats;
}

/** Borra las respuestas de un modo (p. ej. para volver a intentar el Desafío). */
export function resetMode(progress: PhishingProgress, mode: Mode): PhishingProgress {
  return { ...progress, byMode: { ...progress.byMode, [mode]: {} } };
}
