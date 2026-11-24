import { scenarios } from '../data/scenarios';
import {
  INITIAL_PROGRESS,
  answerCase,
  computeStats,
  getRecord,
  phishingProgressSchema,
  retryCase,
  revealNextHint,
  selectCase,
  setMode,
} from './progress';

const [s1, s2] = scenarios;
const ids = scenarios.map((s) => s.id);

describe('progreso del módulo de phishing', () => {
  it('seleccionar un caso lo marca visitado', () => {
    const p = selectCase(INITIAL_PROGRESS, s1.id);
    expect(p.currentCaseId).toBe(s1.id);
    expect(getRecord(p, s1.id).visited).toBe(true);
  });

  it('las pistas avanzan de a una y nunca superan 3', () => {
    let p = selectCase(INITIAL_PROGRESS, s1.id);
    for (let i = 0; i < 6; i++) p = revealNextHint(p, s1);
    expect(getRecord(p, s1.id).hintsRevealed).toBe(3);
  });

  it('en Desafío no se pueden revelar pistas', () => {
    const p = revealNextHint(setMode(INITIAL_PROGRESS, 'challenge'), s1);
    expect(getRecord(p, s1.id).hintsRevealed).toBe(0);
  });

  it('las pistas de un caso no se filtran a otro', () => {
    let p = revealNextHint(selectCase(INITIAL_PROGRESS, s1.id), s1);
    p = selectCase(p, s2.id);
    expect(getRecord(p, s2.id).hintsRevealed).toBe(0);
    expect(getRecord(p, s1.id).hintsRevealed).toBe(1);
  });

  it('la respuesta queda fija y se evalúa', () => {
    let p = answerCase(INITIAL_PROGRESS, s1, 'phishing');
    p = answerCase(p, s1, 'legitimate');
    expect(getRecord(p, s1.id).decision).toBe('phishing');
    expect(getRecord(p, s1.id).outcome).toBe('correct');
  });

  it('Aprender permite reintentar conservando las pistas; Desafío no', () => {
    let p = revealNextHint(INITIAL_PROGRESS, s1);
    p = answerCase(p, s1, 'legitimate');
    p = retryCase(p, s1.id);
    expect(getRecord(p, s1.id).decision).toBeUndefined();
    expect(getRecord(p, s1.id).hintsRevealed).toBe(1);

    let c = answerCase(setMode(INITIAL_PROGRESS, 'challenge'), s1, 'legitimate');
    c = retryCase(c, s1.id);
    expect(getRecord(c, s1.id).decision).toBe('legitimate');
  });

  it('Aprender y Desafío llevan registros separados', () => {
    let p = answerCase(INITIAL_PROGRESS, s1, 'phishing');
    p = setMode(p, 'challenge');
    expect(getRecord(p, s1.id).decision).toBeUndefined();
    p = answerCase(p, s1, 'legitimate');
    expect(computeStats(p, ids, 'learn').correct).toBe(1);
    expect(computeStats(p, ids, 'challenge')).toMatchObject({ answered: 1, correct: 0, risky: 1 });
  });

  it('el esquema completa valores por defecto y rechaza datos inválidos', () => {
    expect(phishingProgressSchema.parse({})).toEqual({ mode: 'learn', currentCaseId: null, byMode: { learn: {}, challenge: {} }, review: null });
    // Un repaso guardado inválido se descarta sin romper el resto del progreso.
    expect(phishingProgressSchema.parse({ review: { caseIds: [] } }).review).toBeNull();
    expect(phishingProgressSchema.safeParse({ mode: 'hacker' }).success).toBe(false);
    expect(
      phishingProgressSchema.safeParse({ byMode: { learn: { 'ARG-001': { hintsRevealed: 9 } }, challenge: {} } }).success,
    ).toBe(false);
  });
});
