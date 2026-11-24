import { useMemo } from 'react';
import { useModuleProgress } from '../../hooks/useModuleProgress';
import {
  INITIAL_PROGRESS,
  answerCase,
  phishingProgressSchema,
  resetMode,
  retryCase,
  revealNextHint,
  selectCase,
  setMode,
  type Mode,
  type PhishingProgress,
} from './domain/progress';
import { clearReview, goToNextReview, markReviewed, pauseReview, startReview } from './domain/review';
import type { Scenario } from './domain/schema';
import type { Decision } from './domain/evaluate';

export const PHISHING_MODULE_ID = 'phishing';

export function usePhishingProgress() {
  const [progress, update, reset] = useModuleProgress<PhishingProgress>(
    PHISHING_MODULE_ID,
    phishingProgressSchema,
    INITIAL_PROGRESS,
  );
  const actions = useMemo(
    () => ({
      // Ir a un caso fuera del repaso, o pasar al Desafío, pone el repaso en pausa.
      select: (id: string) =>
        update((p) => selectCase(p.review?.caseIds.includes(id) && p.mode === 'learn' ? p : pauseReview(p), id)),
      setMode: (mode: Mode) => update((p) => setMode(mode === 'learn' ? p : pauseReview(p), mode)),
      revealHint: (s: Scenario) => update((p) => revealNextHint(p, s)),
      answer: (s: Scenario, d: Decision) => update((p) => markReviewed(answerCase(p, s, d), s.id)),
      retry: (id: string) => update((p) => retryCase(p, id)),
      /** Pasa a un modo y abre un caso en una sola escritura. */
      openIn: (mode: Mode, id: string) => update((p) => selectCase(setMode(pauseReview(p), mode), id)),
      restartChallenge: (firstId: string) =>
        update((p) => selectCase({ ...clearReview(resetMode(p, 'challenge')), mode: 'challenge' }, firstId)),
      /** Repaso guiado de las respuestas riesgosas del Desafío (en Aprender). */
      startReview: (ids: readonly string[]) => update((p) => startReview(p, ids)),
      nextReview: () => update((p) => goToNextReview(p)),
      exitReview: () => update((p) => pauseReview(p)),
      reset,
    }),
    [update, reset],
  );
  return { progress, actions };
}
