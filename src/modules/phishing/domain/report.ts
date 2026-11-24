import type { Scenario } from './schema';
import type { Outcome } from './evaluate';
import { computeStats, type ModeStats, type PhishingProgress } from './progress';
import { CATEGORY_INFO, SIGNAL_CATEGORIES, type SignalCategory } from './categories';

export interface CaseRef {
  id: string;
  title: string;
  /** Posición en la bandeja (0–11). */
  index: number;
  outcome: Outcome;
  /** Tipos de señal presentes en el caso. */
  categories: SignalCategory[];
}

/**
 * Desempeño ESTIMADO en los casos donde aparece un tipo de señal. No dice que
 * la persona haya identificado esa señal: solo cómo resolvió esos casos.
 */
export interface CategoryResult {
  id: SignalCategory;
  label: string;
  /** Casos respondidos donde aparece esta señal. */
  total: number;
  correct: number;
  cautious: number;
  risky: number;
  /** 0–1: casos bien resueltos + media unidad por respuesta prudente (solo para ordenar). */
  ratio: number;
}

/** Tipo de señal recomendado para seguir practicando, con casos relacionados. */
export interface PracticeTopic {
  id: SignalCategory;
  label: string;
  /** Casos relacionados para practicar (no incluye las respuestas para revisar). */
  cases: CaseRef[];
}

export interface ChallengeReport {
  stats: ModeStats;
  /** Desempeño estimado por tipo de señal, de mejor a menos resuelto. */
  categories: CategoryResult[];
  /** (a) Respuestas que de verdad conviene revisar: las riesgosas. Coincide con stats.risky. */
  toReview: CaseRef[];
  /** Respuestas prudentes (no son errores): alternativa cuando no hay nada para revisar. */
  prudent: CaseRef[];
  /** (b) Prácticas adicionales recomendadas: casos relacionados, no son errores. */
  practice: PracticeTopic[];
  /** Tipo de señal menos resuelto (para la recomendación breve), si hay alguno por mejorar. */
  focusCategory: SignalCategory | null;
  /** Caso sugerido para empezar a repasar en Aprender, si hay. */
  firstReviewCaseId: string | null;
  tone: 'excelente' | 'muy-bien' | 'comienzo';
}

const MAX_TOPICS = 4;
const MAX_CASES_PER_TOPIC = 3;

/** Resumen educativo del Desafío, derivado solo de los datos de los casos. */
export function computeChallengeReport(progress: PhishingProgress, scenarios: readonly Scenario[]): ChallengeReport {
  const stats = computeStats(progress, scenarios.map((s) => s.id), 'challenge');

  const answered: CaseRef[] = [];
  scenarios.forEach((s, index) => {
    const outcome = progress.byMode.challenge[s.id]?.outcome;
    if (!outcome) return;
    const cats = SIGNAL_CATEGORIES.filter((c) => s.hints.some((h) => h.category === c));
    answered.push({ id: s.id, title: s.title, index, outcome, categories: cats });
  });

  const categories: CategoryResult[] = SIGNAL_CATEGORIES.map((id) => {
    const cases = answered.filter((c) => c.categories.includes(id));
    const count = (o: Outcome) => cases.filter((c) => c.outcome === o).length;
    const correct = count('correct');
    const cautious = count('cautious');
    const total = cases.length;
    return {
      id,
      label: CATEGORY_INFO[id].label,
      total,
      correct,
      cautious,
      risky: count('risky'),
      ratio: total ? (correct + cautious * 0.5) / total : 0,
    };
  })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.ratio - a.ratio || b.total - a.total);

  const toReview = answered.filter((c) => c.outcome === 'risky');
  const cautious = answered.filter((c) => c.outcome === 'cautious');

  // Tipos de señal para seguir practicando: los de las respuestas para revisar;
  // si no hubo, los de las respuestas prudentes.
  const focus = toReview.length > 0 ? toReview : cautious;
  const weight = (id: SignalCategory) => focus.filter((c) => c.categories.includes(id)).length;
  const reviewIds = new Set(toReview.map((c) => c.id));
  const rank = { cautious: 0, risky: 1, correct: 2 } as const;
  const practice: PracticeTopic[] = SIGNAL_CATEGORIES.filter((id) => weight(id) > 0)
    .map((id) => ({
      id,
      label: CATEGORY_INFO[id].label,
      cases: answered
        .filter((c) => c.categories.includes(id) && !reviewIds.has(c.id))
        .sort((a, b) => rank[a.outcome] - rank[b.outcome] || a.index - b.index)
        .slice(0, MAX_CASES_PER_TOPIC),
    }))
    .filter((t) => t.cases.length > 0)
    .sort((a, b) => weight(b.id) - weight(a.id))
    .slice(0, MAX_TOPICS);

  const weakest = [...categories]
    .filter((c) => c.ratio < 1)
    .sort((a, b) => a.ratio - b.ratio || b.risky - a.risky || b.total - a.total)[0];
  const focusCategory = weakest?.id ?? null;

  const firstReviewCaseId = toReview[0]?.id ?? cautious[0]?.id ?? null;
  const score = stats.total ? stats.correct / stats.total : 0;
  const tone = score >= 0.8 ? 'excelente' : score >= 0.5 ? 'muy-bien' : 'comienzo';

  return { stats, categories, toReview, prudent: cautious, practice, focusCategory, firstReviewCaseId, tone };
}
