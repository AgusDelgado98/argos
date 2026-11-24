import { CheckCircle2, Eye, ShieldQuestion } from 'lucide-react';
import type { Scenario } from '../domain/schema';
import type { CaseRecord } from '../domain/progress';

interface Props {
  scenarios: readonly Scenario[];
  currentId: string;
  records: Record<string, CaseRecord>;
  onSelect: (id: string) => void;
  open: boolean;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 2 || /^[A-ZÁÉÍÓÚ]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

const STATUS = {
  correct: { icon: CheckCircle2, label: 'Respondido: buena observación', cls: 'ok' },
  cautious: { icon: ShieldQuestion, label: 'Respondido: buena intuición', cls: 'warn' },
  risky: { icon: Eye, label: 'Respondido: señales para repasar', cls: 'warn' },
} as const;

export function InboxList({ scenarios, currentId, records, onSelect, open }: Props) {
  const unread = scenarios.filter((s) => !records[s.id]?.visited).length;
  return (
    <nav className={`inbox${open ? ' is-open' : ''}`} aria-labelledby="inbox-title" id="bandeja">
      <div className="inbox-head">
        <h2 id="inbox-title">Bandeja de entrada</h2>
        <span className="inbox-count">
          {scenarios.length} mensajes · {unread} sin leer
        </span>
      </div>
      <ul className="inbox-list">
        {scenarios.map((s, i) => {
          const r = records[s.id];
          const status = r?.outcome ? STATUS[r.outcome] : null;
          const selected = s.id === currentId;
          return (
            <li key={s.id}>
              <button
                type="button"
                className={`inbox-item${selected ? ' is-selected' : ''}${r?.visited ? '' : ' is-unread'}`}
                aria-current={selected ? 'true' : undefined}
                onClick={() => onSelect(s.id)}
              >
                <span className="inbox-avatar" aria-hidden="true">
                  {initials(s.senderName)}
                </span>
                <span className="inbox-main">
                  <span className="inbox-row">
                    <span className="inbox-sender">{s.senderName}</span>
                    <span className="inbox-date">{s.receivedAt}</span>
                  </span>
                  <span className="inbox-subject">{s.subject}</span>
                  <span className="inbox-preview">{s.preview}</span>
                </span>
                <span className="inbox-status">
                  {status ? (
                    <status.icon size={18} className={`st-${status.cls}`} aria-label={status.label} role="img" />
                  ) : (
                    !r?.visited && <span className="unread-dot" aria-label="Sin leer" role="img" />
                  )}
                </span>
                <span className="visually-hidden">, mensaje {i + 1} de {scenarios.length}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
