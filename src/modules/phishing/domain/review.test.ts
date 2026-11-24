import { scenarios } from '../data/scenarios';
import { INITIAL_PROGRESS, answerCase, computeStats, setMode, type PhishingProgress } from './progress';
import { goToNextReview, isReviewComplete, markReviewed, nextPending, pauseReview, startReview } from './review';
import type { Decision } from './evaluate';

const IDS = scenarios.map((s) => s.id);
const byId = (id: string) => scenarios.find((s) => s.id === id)!;
const answer = (p: PhishingProgress, id: string, d: Decision) => markReviewed(answerCase(p, byId(id), d), id);

function challengeWithRisky(): PhishingProgress {
  let p = setMode(INITIAL_PROGRESS, 'challenge');
  for (const s of scenarios) {
    const d: Decision = s.id === 'ARG-006' || s.id === 'ARG-010' ? 'legitimate' : s.classification;
    p = answerCase(p, s, d);
  }
  return p;
}

describe('repaso guiado', () => {
  it('varios casos: abre el primero en Aprender, avanza y termina', () => {
    const base = challengeWithRisky();
    let p = startReview(base, ['ARG-006', 'ARG-010']);
    expect(p.mode).toBe('learn');
    expect(p.currentCaseId).toBe('ARG-006');
    expect(p.review).toMatchObject({ caseIds: ['ARG-006', 'ARG-010'], done: [], active: true });

    p = answer(p, 'ARG-006', 'phishing');
    expect(p.review!.done).toEqual(['ARG-006']);
    expect(nextPending(p.review)).toBe('ARG-010');
    p = goToNextReview(p);
    expect(p.currentCaseId).toBe('ARG-010');
    p = answer(p, 'ARG-010', 'needs_more_info');
    expect(isReviewComplete(p.review)).toBe(true);
    expect(nextPending(p.review)).toBeNull();
  });

  it('un caso: se completa al responderlo', () => {
    let p = startReview(challengeWithRisky(), ['ARG-006']);
    p = answer(p, 'ARG-006', 'phishing');
    expect(isReviewComplete(p.review)).toBe(true);
  });

  it('cero casos: no inicia nada', () => {
    const base = challengeWithRisky();
    expect(startReview(base, [])).toBe(base);
  });

  it('no modifica las respuestas ni el puntaje del Desafío', () => {
    const base = challengeWithRisky();
    const before = structuredClone(base.byMode.challenge);
    let p = startReview(base, ['ARG-006', 'ARG-010']);
    p = answer(p, 'ARG-006', 'phishing');
    p = answer(p, 'ARG-010', 'needs_more_info');
    expect(p.byMode.challenge).toEqual(before);
    expect(computeStats(p, IDS, 'challenge')).toEqual(computeStats(base, IDS, 'challenge'));
  });

  it('salir y retomar continúa donde quedó', () => {
    let p = startReview(challengeWithRisky(), ['ARG-006', 'ARG-010']);
    p = answer(p, 'ARG-006', 'phishing');
    p = pauseReview(p);
    expect(p.review).toMatchObject({ active: false, done: ['ARG-006'] });
    // Respuestas fuera del repaso activo no cuentan.
    p = startReview(p, ['ARG-006', 'ARG-010']);
    expect(p.review).toMatchObject({ active: true, done: ['ARG-006'] });
    expect(p.currentCaseId).toBe('ARG-010');
  });

  it('iniciar un repaso nuevo limpia solo las respuestas de Aprender de esos casos', () => {
    let p = setMode(challengeWithRisky(), 'learn');
    p = answerCase(p, byId('ARG-006'), 'legitimate');
    p = answerCase(p, byId('ARG-001'), 'phishing');
    p = startReview(p, ['ARG-006']);
    expect(p.byMode.learn['ARG-006'].decision).toBeUndefined();
    expect(p.byMode.learn['ARG-001'].decision).toBe('phishing');
  });
});
