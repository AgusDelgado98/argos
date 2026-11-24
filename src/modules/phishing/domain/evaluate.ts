import type { Classification, Scenario } from './schema';

export type Decision = Classification;

/**
 * - correct: coincide con la clasificación.
 * - cautious: no acertó, pero no confió en algo dudoso (o desconfió de algo legítimo).
 * - risky: confió en un mensaje que no lo merecía.
 */
export type Outcome = 'correct' | 'cautious' | 'risky';

export const DECISION_LABELS: Record<Decision, string> = {
  legitimate: 'Parece legítimo',
  phishing: 'Es un posible phishing',
  needs_more_info: 'No tengo suficiente información',
};

export const CLASSIFICATION_LABELS: Record<Classification, string> = {
  legitimate: 'Mensaje legítimo',
  phishing: 'Intento de phishing',
  needs_more_info: 'Requiere verificación',
};

export function evaluateDecision(scenario: Pick<Scenario, 'classification'>, decision: Decision): Outcome {
  if (decision === scenario.classification) return 'correct';
  if (decision === 'legitimate') return 'risky';
  return 'cautious';
}

/** Devoluciones constructivas: nunca «incorrecto», siempre qué mirar la próxima vez. */
export const OUTCOME_COPY: Record<Outcome, { badge: string; message: string }> = {
  correct: { badge: '¡Buena observación!', message: 'Leíste bien las señales de este correo.' },
  cautious: {
    badge: 'Buena intuición',
    message: 'No confiaste a ciegas, y eso suma. Esta vez se escapó un matiz: mirá qué cambiaba la respuesta.',
  },
  risky: {
    badge: 'Esta vez se escapó una señal',
    message: 'Pasa seguido: lo importante es reconocer la señal la próxima vez.',
  },
};

export interface FeedbackMessage {
  badge: string;
  /** Frase específica del caso: qué señal importaba. */
  signal: string;
  /** Respuesta más adecuada (solo si no se eligió). */
  bestAnswer: string | null;
  lead: string | null;
}

/**
 * Mensaje de devolución específico del caso: nombra la señal clave y, si no se
 * acertó, cuál era la respuesta más adecuada. Amable y sin castigo.
 */
export function feedbackMessage(
  scenario: Pick<Scenario, 'classification' | 'keySignal'>,
  decision: Decision,
): FeedbackMessage {
  const outcome = evaluateDecision(scenario, decision);
  const correct = outcome === 'correct';
  return {
    badge: OUTCOME_COPY[outcome].badge,
    lead: correct ? 'Leíste bien las señales.' : outcome === 'cautious' ? 'No confiaste a ciegas, y eso suma.' : null,
    signal: scenario.keySignal,
    bestAnswer: correct ? null : DECISION_LABELS[scenario.classification],
  };
}

export function outcomeExtraNote(scenario: Pick<Scenario, 'classification'>, decision: Decision): string | null {
  if (decision === scenario.classification) return null;
  if (scenario.classification === 'legitimate' && decision === 'phishing') {
    return 'Desconfiar de todo también tiene un costo: perderías avisos reales. La clave es verificar por otro canal, no descartar por reflejo.';
  }
  if (scenario.classification === 'needs_more_info' && decision === 'phishing') {
    return 'No había señales suficientes para afirmar un fraude. Ante la duda, el paso correcto es verificar antes de actuar.';
  }
  if (scenario.classification === 'phishing' && decision === 'needs_more_info') {
    return 'Frenar fue una buena idea. Además, este mensaje ya tenía señales claras de fraude, así que podías reportarlo directamente.';
  }
  if (scenario.classification === 'legitimate' && decision === 'needs_more_info') {
    return 'Verificar nunca está de más, aunque acá el mensaje no tenía señales de riesgo.';
  }
  return null;
}
