import { ChevronDown, Eye, Lightbulb, Lock, Trophy } from 'lucide-react';
import type { Scenario } from '../domain/schema';
import type { Mode } from '../domain/progress';

interface Props {
  scenario: Scenario;
  mode: Mode;
  revealed: number;
  answered: boolean;
  active: number | null;
  onReveal: () => void;
  onFocusHint: (marker: number | null) => void;
}

export function HintsPanel({ scenario, mode, revealed, answered, active, onReveal, onFocusHint }: Props) {
  const total = Math.min(3, scenario.hints.length);
  const shown = answered ? total : mode === 'learn' ? Math.min(revealed, total) : 0;
  const canReveal = mode === 'learn' && !answered && revealed < total;

  return (
    <aside className="hints" aria-labelledby="hints-title">
      <div className="card hints-card">
        <div className="hints-head">
          <h2 id="hints-title">
            <Eye size={20} aria-hidden="true" /> Pistas del caso
          </h2>
          <span className="hints-counter" aria-live="polite">
            {answered ? 'Todas las señales a la vista' : mode === 'learn' ? `Pistas reveladas: ${shown} de ${total}` : 'Ocultas en Desafío'}
          </span>
        </div>

        {mode === 'challenge' && !answered ? (
          <p className="hints-locked-msg">
            <Trophy size={18} aria-hidden="true" />
            <span>En modo Desafío las pistas se ocultan hasta que respondas. Confiá en tu observación.</span>
          </p>
        ) : (
          <ol className="hint-list">
            {scenario.hints.slice(0, total).map((hint, i) => {
              const n = i + 1;
              const isShown = n <= shown;
              if (!isShown) {
                return (
                  <li key={hint.id} className="hint is-locked">
                    <span className="hint-num" aria-hidden="true">{n}</span>
                    <span className="hint-title">Pista {n}</span>
                    <Lock size={16} aria-label="bloqueada" role="img" />
                  </li>
                );
              }
              const isActive = active === n;
              return (
                <li key={hint.id} className={`hint${isActive ? ' is-active' : ''}`}>
                  <button
                    type="button"
                    className="hint-btn"
                    aria-pressed={isActive}
                    onClick={() => onFocusHint(isActive ? null : n)}
                  >
                    <span className="hint-num" aria-hidden="true">{n}</span>
                    <span className="hint-title">{hint.title}</span>
                    <ChevronDown size={16} aria-hidden="true" className="hint-chev" />
                  </button>
                  <p className="hint-text">{hint.text}.</p>
                </li>
              );
            })}
          </ol>
        )}
        {shown > 0 && <p className="hints-tip">Tocá una pista para resaltar su señal en el correo.</p>}
      </div>

      {mode === 'learn' && !answered && (
        <div className="card hint-cta">
          <Lightbulb size={26} aria-hidden="true" />
          <div>
            <strong>¿Necesitás una pista?</strong>
            <p>{canReveal ? 'Podés revelar una ayuda para orientarte.' : 'Ya viste todas las pistas de este caso.'}</p>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={onReveal} disabled={!canReveal}>
            <Eye size={16} aria-hidden="true" /> Mostrar pista
          </button>
        </div>
      )}
    </aside>
  );
}
