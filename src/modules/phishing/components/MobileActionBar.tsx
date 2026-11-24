import { ArrowRight, Lightbulb, MessageSquareText, Send } from 'lucide-react';
import type { Mode } from '../domain/progress';

interface Props {
  mode: Mode;
  answered: boolean;
  hintsShown: number;
  hintsTotal: number;
  onHints: () => void;
  onRespond: () => void;
  onFeedback: () => void;
  onNext?: () => void;
  nextLabel?: string;
}

/** Barra fija inferior (móvil): primero se observa el correo, después se responde. */
export function MobileActionBar({ mode, answered, hintsShown, hintsTotal, onHints, onRespond, onFeedback, onNext, nextLabel = 'Siguiente caso' }: Props) {
  return (
    <div className="mobile-bar" role="region" aria-label="Acciones del caso">
      {answered ? (
        <>
          <button type="button" className="btn btn-outline mobile-bar-btn" onClick={onFeedback}>
            <MessageSquareText size={18} aria-hidden="true" /> Ver devolución
          </button>
          {onNext && (
            <button type="button" className="btn btn-navy mobile-bar-btn" onClick={onNext}>
              {nextLabel} <ArrowRight size={18} aria-hidden="true" />
            </button>
          )}
        </>
      ) : (
        <>
          {mode === 'learn' && (
            <button type="button" className="btn btn-outline mobile-bar-btn mobile-bar-hints" onClick={onHints}>
              <Lightbulb size={18} aria-hidden="true" /> Pistas {hintsShown}/{hintsTotal}
            </button>
          )}
          <button type="button" className="btn btn-primary mobile-bar-btn mobile-bar-main" onClick={onRespond}>
            <Send size={18} aria-hidden="true" /> Responder
          </button>
        </>
      )}
    </div>
  );
}
