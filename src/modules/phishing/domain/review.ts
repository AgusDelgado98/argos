import { getRecord, selectCase, setMode, type PhishingProgress, type ReviewState } from './progress';

/** Primer caso del repaso que todavía no se respondió. */
export function nextPending(review: ReviewState | null | undefined): string | null {
  if (!review) return null;
  return review.caseIds.find((id) => !review.done.includes(id)) ?? null;
}

export function isReviewComplete(review: ReviewState | null | undefined): boolean {
  return !!review && review.caseIds.every((id) => review.done.includes(id));
}

function sameCases(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

/**
 * Inicia (o retoma) el repaso de unos casos en Aprender y abre el primero pendiente.
 * Al iniciar uno nuevo se limpian solo las respuestas de Aprender de esos casos,
 * para poder responderlos otra vez. El Desafío no se toca.
 */
export function startReview(progress: PhishingProgress, caseIds: readonly string[], now = new Date()): PhishingProgress {
  if (caseIds.length === 0) return progress;
  const current = progress.review;
  let next: PhishingProgress;
  if (current && sameCases(current.caseIds, caseIds) && !isReviewComplete(current)) {
    next = { ...progress, review: { ...current, active: true } };
  } else {
    const learn = { ...progress.byMode.learn };
    for (const id of caseIds) {
      learn[id] = { visited: true, hintsRevealed: getRecord(progress, id, 'learn').hintsRevealed };
    }
    next = {
      ...progress,
      byMode: { ...progress.byMode, learn },
      review: { caseIds: [...caseIds], done: [], active: true, startedAt: now.toISOString() },
    };
  }
  return selectCase(setMode(next, 'learn'), nextPending(next.review)!);
}

/** Marca un caso del repaso como recorrido (al responderlo en Aprender). */
export function markReviewed(progress: PhishingProgress, caseId: string): PhishingProgress {
  const r = progress.review;
  if (!r || !r.active || progress.mode !== 'learn' || !r.caseIds.includes(caseId) || r.done.includes(caseId)) return progress;
  if (!getRecord(progress, caseId, 'learn').decision) return progress;
  return { ...progress, review: { ...r, done: [...r.done, caseId] } };
}

/** Abre el siguiente caso pendiente del repaso. */
export function goToNextReview(progress: PhishingProgress): PhishingProgress {
  const id = nextPending(progress.review);
  return id ? selectCase(setMode(progress, 'learn'), id) : progress;
}

/** Sale del repaso (o lo cierra al terminar) sin perder lo recorrido. */
export function pauseReview(progress: PhishingProgress): PhishingProgress {
  return progress.review?.active ? { ...progress, review: { ...progress.review, active: false } } : progress;
}

/** Descarta el repaso (p. ej. al volver a intentar el Desafío). */
export function clearReview(progress: PhishingProgress): PhishingProgress {
  return progress.review ? { ...progress, review: null } : progress;
}
