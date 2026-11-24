import { ArrowRight, Binoculars, CircleCheck, CircleHelp, RotateCcw, TriangleAlert } from 'lucide-react';
import { DECISION_LABELS, type Decision } from '../domain/evaluate';
import type { Mode } from '../domain/progress';

interface Props {
  mode: Mode;
  decision?: Decision;
  onDecide: (d: Decision) => void;
  onRetry: () => void;
  onNext?: () => void;
  nextLabel?: string;
}

const OPTIONS: { value: Decision; icon: typeof CircleCheck }[] = [
  { value: 'legitimate', icon: CircleCheck },
  { value: 'phishing', icon: TriangleAlert },
  { value: 'needs_more_info', icon: CircleHelp },
];

export function DecisionBar({ mode, decision, onDecide, onRetry, onNext, nextLabel = 'Siguiente caso' }: Props) {
  const answered = decision !== undefined;
  return (
    <section className="card decision" aria-labelledby="decision-title">
      <div className="decision-q">
        <Binoculars size={26} aria-hidden="true" />
        <div>
          <h2 id="decision-title">¿Qué harías con este mensaje?</h2>
          <p>{answered ? 'Tu respuesta quedó registrada.' : 'Elegí la opción que consideres más adecuada.'}</p>
        </div>
      </div>
      <div className="decision-options" role="group" aria-labelledby="decision-title">
        {OPTIONS.map(({ value, icon: Icon }) => {
          const chosen = decision === value;
          return (
            <button
              key={value}
              type="button"
              className={`decision-btn${chosen ? ' is-chosen' : ''}`}
              onClick={() => onDecide(value)}
              disabled={answered}
              aria-pressed={chosen}
            >
              <Icon size={22} aria-hidden="true" />
              <span>{DECISION_LABELS[value]}</span>
              {chosen && <span className="decision-chosen">Tu elección</span>}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="decision-after">
          {mode === 'learn' && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onRetry}>
              <RotateCcw size={16} aria-hidden="true" /> Intentar de nuevo
            </button>
          )}
          {onNext && (
            <button type="button" className="btn btn-navy btn-sm" onClick={onNext}>
              {nextLabel} <ArrowRight size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
