import { GraduationCap, Trophy } from 'lucide-react';
import { MODE_LABELS, type Mode } from '../domain/progress';

const DESCRIPTIONS: Record<Mode, string> = {
  learn: 'Hasta tres pistas por caso y explicación al responder. Podés reintentar.',
  challenge: 'Sin pistas hasta responder. Cada caso se responde una vez y suma puntaje.',
};

export function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="mode-switch">
      <div className="mode-buttons" role="group" aria-label="Modo de práctica">
        {(['learn', 'challenge'] as const).map((m) => {
          const Icon = m === 'learn' ? GraduationCap : Trophy;
          return (
            <button
              key={m}
              type="button"
              className={`mode-btn${mode === m ? ' is-active' : ''}`}
              aria-pressed={mode === m}
              onClick={() => onChange(m)}
            >
              <Icon size={16} aria-hidden="true" /> {MODE_LABELS[m]}
            </button>
          );
        })}
      </div>
      <p className="mode-desc">{DESCRIPTIONS[mode]}</p>
    </div>
  );
}
