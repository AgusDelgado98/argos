import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Binoculars, ChevronDown, CircleCheck, CircleHelp, Eye, Lightbulb, MessageSquareText, RotateCcw, TriangleAlert } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import type { Scenario } from '../domain/schema';
import type { CaseRecord, Mode } from '../domain/progress';
import {
  CLASSIFICATION_LABELS,
  DECISION_LABELS,
  OUTCOME_COPY,
  outcomeExtraNote,
  type Decision,
} from '../domain/evaluate';
import { getConcept } from '../../theory/glossary';
import { OUTCOME_BADGE } from './CaseAnalysis';
import { FeedbackMessage } from './FeedbackMessage';

export type SheetView = 'decide' | 'hints' | 'feedback';

interface Props {
  open: boolean;
  view: SheetView;
  scenario: Scenario;
  mode: Mode;
  record: CaseRecord;
  onClose: () => void;
  onView: (v: SheetView) => void;
  onDecide: (d: Decision) => void;
  onReveal: () => void;
  onRetry: () => void;
  onNext?: () => void;
  nextLabel?: string;
}

const OPTIONS = [
  { value: 'legitimate', icon: CircleCheck },
  { value: 'phishing', icon: TriangleAlert },
  { value: 'needs_more_info', icon: CircleHelp },
] as const;

const TITLES: Record<SheetView, string> = {
  decide: '¿Qué harías con este mensaje?',
  hints: 'Pistas del caso',
  feedback: 'Devolución del caso',
};

/** Panel inferior del simulador en móvil: decidir, pedir pistas y leer la devolución. */
export function MobileSheet(props: Props) {
  const { open, view, scenario, mode, record, onClose, onView, onReveal, onRetry, onNext, nextLabel } = props;
  const bodyRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  // Al cambiar de vista dentro del panel, el foco va al inicio del contenido nuevo.
  useEffect(() => {
    if (!open) {
      first.current = true;
      return;
    }
    if (first.current) {
      first.current = false;
      return;
    }
    bodyRef.current?.focus();
  }, [open, view]);

  const icon =
    view === 'hints' ? <Eye size={20} aria-hidden="true" /> : view === 'feedback' ? <MessageSquareText size={20} aria-hidden="true" /> : <Binoculars size={20} aria-hidden="true" />;

  return (
    <Modal open={open} title={TITLES[view]} onClose={onClose} variant="sheet" icon={icon}>
      <div ref={bodyRef} tabIndex={-1} className="sheet-body">
        {view === 'decide' && <DecideView {...props} />}
        {view === 'hints' && <HintsView scenario={scenario} revealed={record.hintsRevealed} onReveal={onReveal} onDecide={() => onView('decide')} />}
        {view === 'feedback' && record.decision && record.outcome && (
          <FeedbackView scenario={scenario} mode={mode} record={record} onRetry={onRetry} onNext={onNext} nextLabel={nextLabel} />
        )}
      </div>
    </Modal>
  );
}

function DecideView({ mode, record, onDecide, onView, scenario }: Props) {
  const total = Math.min(3, scenario.hints.length);
  return (
    <>
      <p className="sheet-lead">Elegí la opción que consideres más adecuada.</p>
      <div className="sheet-options" role="group" aria-label="Decisiones">
        {OPTIONS.map(({ value, icon: Icon }) => (
          <button key={value} type="button" className="decision-btn" onClick={() => onDecide(value)}>
            <Icon size={22} aria-hidden="true" />
            <span>{DECISION_LABELS[value]}</span>
          </button>
        ))}
      </div>
      {mode === 'learn' ? (
        <button type="button" className="btn btn-ghost btn-sm sheet-link" onClick={() => onView('hints')}>
          <Lightbulb size={16} aria-hidden="true" /> ¿Dudás? Ver pistas ({record.hintsRevealed}/{total})
        </button>
      ) : (
        <p className="sheet-note">Modo Desafío: las pistas aparecen en la devolución.</p>
      )}
    </>
  );
}

function HintsView({ scenario, revealed, onReveal, onDecide }: { scenario: Scenario; revealed: number; onReveal: () => void; onDecide: () => void }) {
  const total = Math.min(3, scenario.hints.length);
  const shown = Math.min(revealed, total);
  return (
    <>
      <p className="sheet-lead" aria-live="polite">
        Pistas reveladas: {shown} de {total}. Cada pista resalta su señal en el correo.
      </p>
      {shown > 0 && (
        <ol className="sheet-hints">
          {scenario.hints.slice(0, shown).map((h, i) => (
            <li key={h.id}>
              <span className="hint-num" aria-hidden="true">{i + 1}</span>
              <span>
                <strong>{h.title}</strong>
                {h.text}.
              </span>
            </li>
          ))}
        </ol>
      )}
      <div className="sheet-actions">
        <button type="button" className="btn btn-outline" onClick={onReveal} disabled={shown >= total}>
          <Eye size={16} aria-hidden="true" /> {shown >= total ? 'Ya viste todas las pistas' : 'Mostrar pista'}
        </button>
        <button type="button" className="btn btn-primary" onClick={onDecide}>
          Elegir respuesta
        </button>
      </div>
    </>
  );
}

function FeedbackView({ scenario, mode, record, onRetry, onNext, nextLabel = "Siguiente caso" }: { scenario: Scenario; mode: Mode; record: CaseRecord; onRetry: () => void; onNext?: () => void; nextLabel?: string }) {
  const [expanded, setExpanded] = useState(false);
  const moreId = useId();
  const decision = record.decision as Decision;
  const outcome = record.outcome!;
  const extra = outcomeExtraNote(scenario, decision);
  const concepts = scenario.concepts.map(getConcept).filter((c) => c !== undefined);
  const numbered = scenario.hints.map((h, i) => ({ ...h, n: i + 1 }));
  const key = numbered.filter((h) => scenario.keyHints.includes(h.n));
  const rest = numbered.filter((h) => !scenario.keyHints.includes(h.n));
  const signalList = (items: typeof numbered) => (
    <ol className="sheet-hints">
      {items.map((h) => (
        <li key={h.id}>
          <span className="hint-num" aria-hidden="true">{h.n}</span>
          <span>{h.text}.</span>
        </li>
      ))}
    </ol>
  );
  return (
    <>
      <div className={`feedback-status is-${outcome}`}>
        <span className={`badge ${OUTCOME_BADGE[outcome]}`}>{OUTCOME_COPY[outcome].badge}</span>
        <FeedbackMessage scenario={scenario} decision={decision} />
      </div>
      <h3 className="feedback-h">Lo que conviene mirar</h3>
      {signalList(key)}
      <button
        type="button"
        className="btn btn-ghost btn-sm feedback-toggle"
        aria-expanded={expanded}
        aria-controls={moreId}
        onClick={() => setExpanded((v) => !v)}
      >
        <ChevronDown size={16} aria-hidden="true" className={expanded ? 'is-open' : undefined} />
        {expanded ? 'Ver menos' : 'Ver análisis completo'}
      </button>
      <div id={moreId} className="feedback-full" hidden={!expanded}>
        {rest.length > 0 && (
          <>
            <h4 className="feedback-sub">Otras señales</h4>
            {signalList(rest)}
          </>
        )}
        <p className="feedback-meta">
          <span>Elegiste: <strong>{DECISION_LABELS[decision]}</strong></span>
          <span>Era: <strong>{CLASSIFICATION_LABELS[scenario.classification]}</strong></span>
        </p>
        <h4 className="feedback-sub">Por qué: {scenario.feedback.summary}</h4>
        <p>{scenario.feedback.explanation}</p>
        {extra && <p className="feedback-extra">{extra}</p>}
        <h4 className="feedback-sub">Qué hacer y cómo verificarlo</h4>
        <p><strong>Acción recomendada:</strong> {scenario.feedback.recommendedAction}</p>
        <p><strong>Cómo verificarlo:</strong> {scenario.feedback.verify}</p>
        {concepts.length > 0 && (
          <ul className="analysis-concepts">
            {concepts.map((c) => (
              <li key={c.id}>
                <Link to={`/conceptos#${c.id}`}>{c.term}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="sheet-actions">
        {mode === 'learn' && (
          <button type="button" className="btn btn-ghost" onClick={onRetry}>
            <RotateCcw size={16} aria-hidden="true" /> Intentar de nuevo
          </button>
        )}
        {onNext && (
          <button type="button" className="btn btn-navy" onClick={onNext}>
            {nextLabel} <ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </>
  );
}
