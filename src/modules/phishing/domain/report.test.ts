import { scenarios } from '../data/scenarios';
import { INITIAL_PROGRESS, answerCase, setMode, type PhishingProgress } from './progress';
import { computeChallengeReport } from './report';
import type { Decision } from './evaluate';
import { SIGNAL_CATEGORIES } from './categories';

/** Resultado mixto realista: 8 bien, 2 prudentes, 2 para repasar. */
export const MIXED: Record<string, Decision> = {
  'ARG-001': 'phishing',
  'ARG-002': 'legitimate',
  'ARG-003': 'phishing', // prudente
  'ARG-004': 'phishing',
  'ARG-005': 'legitimate',
  'ARG-006': 'legitimate', // para repasar
  'ARG-007': 'needs_more_info',
  'ARG-008': 'legitimate',
  'ARG-009': 'phishing',
  'ARG-010': 'legitimate', // para repasar
  'ARG-011': 'phishing',
  'ARG-012': 'needs_more_info', // prudente
};

function play(decisions: Record<string, Decision>): PhishingProgress {
  let p = setMode(INITIAL_PROGRESS, 'challenge');
  for (const s of scenarios) if (decisions[s.id]) p = answerCase(p, s, decisions[s.id]);
  return p;
}

describe('resumen del Desafío', () => {
  it('cada pista tiene una categoría de señal válida', () => {
    for (const s of scenarios) for (const h of s.hints) expect(SIGNAL_CATEGORIES).toContain(h.category);
  });

  it('resultado mixto: desempeño estimado por tipo de señal, en casos', () => {
    const r = computeChallengeReport(play(MIXED), scenarios);
    expect(r.stats).toMatchObject({ answered: 12, correct: 8, cautious: 2, risky: 2 });
    expect(r.tone).toBe('muy-bien');
    const dominio = r.categories.find((c) => c.id === 'dominio')!;
    expect(dominio).toMatchObject({ total: 3, correct: 3, cautious: 0, risky: 0 });
    const remitente = r.categories.find((c) => c.id === 'remitente')!;
    expect(remitente).toMatchObject({ total: 3, correct: 0, cautious: 1, risky: 2 });
    // Cada categoría cuenta solo casos respondidos donde aparece esa señal.
    for (const c of r.categories) expect(c.correct + c.cautious + c.risky).toBe(c.total);
  });

  it('separa respuestas para revisar de casos relacionados para practicar', () => {
    const r = computeChallengeReport(play(MIXED), scenarios);
    // (a) Solo las respuestas riesgosas reales; coincide con el contador.
    expect(r.toReview.map((c) => c.id)).toEqual(['ARG-006', 'ARG-010']);
    expect(r.toReview).toHaveLength(r.stats.risky);
    expect(r.toReview.every((c) => c.outcome === 'risky')).toBe(true);
    // (b) Casos relacionados: nunca repiten las respuestas para revisar.
    const reviewIds = new Set(r.toReview.map((c) => c.id));
    expect(r.practice.length).toBeGreaterThan(0);
    for (const t of r.practice) {
      expect(t.cases.length).toBeGreaterThan(0);
      for (const c of t.cases) {
        expect(reviewIds.has(c.id)).toBe(false);
        expect(c.outcome).not.toBe('risky');
      }
    }
    // El tipo de señal con más respuestas para revisar va primero.
    expect(r.practice[0].id).toBe('remitente');
    expect(r.practice[0].cases.map((c) => c.id)).toEqual(['ARG-003']);
    // Incluye casos multitema bien resueltos, sin marcarlos como errores.
    const urgencia = r.practice.find((t) => t.id === 'urgencia')!;
    expect(urgencia.cases.map((c) => [c.id, c.outcome])).toEqual([
      ['ARG-001', 'correct'],
      ['ARG-009', 'correct'],
      ['ARG-011', 'correct'],
    ]);
    expect(r.firstReviewCaseId).toBe('ARG-006');
  });

  it('todo bien resuelto: nada para revisar ni practicar', () => {
    const perfect = Object.fromEntries(scenarios.map((s) => [s.id, s.classification]));
    const r = computeChallengeReport(play(perfect), scenarios);
    expect(r.stats.correct).toBe(12);
    expect(r.toReview).toEqual([]);
    expect(r.practice).toEqual([]);
    expect(r.firstReviewCaseId).toBeNull();
    expect(r.tone).toBe('excelente');
  });

  it('solo respuestas prudentes: sin respuestas para revisar, pero con práctica sugerida', () => {
    const cautious = Object.fromEntries(
      scenarios.map((s) => [s.id, s.id === 'ARG-012' ? 'needs_more_info' : s.classification] as [string, Decision]),
    );
    const r = computeChallengeReport(play(cautious), scenarios);
    expect(r.stats).toMatchObject({ correct: 11, cautious: 1, risky: 0 });
    expect(r.toReview).toEqual([]);
    expect(r.practice.flatMap((t) => t.cases.map((c) => c.id))).toContain('ARG-012');
    expect(r.firstReviewCaseId).toBe('ARG-012');
  });

  it('resultado bajo: tono de comienzo y todas las categorías con conteos', () => {
    const allTrust = Object.fromEntries(scenarios.map((s) => [s.id, 'legitimate' as Decision]));
    const r = computeChallengeReport(play(allTrust), scenarios);
    expect(r.tone).toBe('comienzo');
    expect(r.categories.length).toBe(8);
  });
});

describe('recomendación breve del resumen', () => {
  it('apunta al tipo de señal menos resuelto', () => {
    const r = computeChallengeReport(play(MIXED), scenarios);
    expect(r.focusCategory).toBe('remitente');
  });
  it('sin nada por mejorar no hay foco', () => {
    const perfect = Object.fromEntries(scenarios.map((s) => [s.id, s.classification]));
    expect(computeChallengeReport(play(perfect), scenarios).focusCategory).toBeNull();
  });
});
