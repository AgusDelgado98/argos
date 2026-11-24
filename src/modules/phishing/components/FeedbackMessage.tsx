import type { Scenario } from '../domain/schema';
import { feedbackMessage, type Decision } from '../domain/evaluate';

/** Frase de devolución específica del caso (señal clave + respuesta más adecuada). */
export function FeedbackMessage({ scenario, decision, className }: { scenario: Scenario; decision: Decision; className?: string }) {
  const m = feedbackMessage(scenario, decision);
  return (
    <p className={className}>
      {m.lead && <>{m.lead} </>}
      {m.signal}
      {m.bestAnswer && (
        <>
          {' '}
          La respuesta más adecuada era: <strong>«{m.bestAnswer}»</strong>.
        </>
      )}
    </p>
  );
}
