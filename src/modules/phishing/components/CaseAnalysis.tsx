import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldHalf, SearchCheck } from 'lucide-react';
import type { Scenario } from '../domain/schema';
import {
  CLASSIFICATION_LABELS,
  DECISION_LABELS,
  OUTCOME_COPY,
  outcomeExtraNote,
  type Decision,
  type Outcome,
} from '../domain/evaluate';
import { getConcept } from '../../theory/glossary';
import { FeedbackMessage } from './FeedbackMessage';

interface Props {
  scenario: Scenario;
  decision: Decision;
  outcome: Outcome;
}

export const OUTCOME_BADGE: Record<Outcome, string> = { correct: 'badge-ok', cautious: 'badge-warm', risky: 'badge-warm' };

export const CaseAnalysis = forwardRef<HTMLElement, Props>(function CaseAnalysis({ scenario, decision, outcome }, ref) {
  const extra = outcomeExtraNote(scenario, decision);
  const concepts = scenario.concepts.map(getConcept).filter((c) => c !== undefined);
  return (
    <section className="card analysis" aria-labelledby="analysis-title" ref={ref} tabIndex={-1}>
      <div className="analysis-col analysis-status">
        <h2 id="analysis-title">
          <ShieldHalf size={24} aria-hidden="true" /> Análisis del caso
        </h2>
        <span className={`badge ${OUTCOME_BADGE[outcome]}`}>{OUTCOME_COPY[outcome].badge}</span>
        <dl className="analysis-meta">
          <div>
            <dt>Tu respuesta</dt>
            <dd>{DECISION_LABELS[decision]}</dd>
          </div>
          <div>
            <dt>Qué era</dt>
            <dd>{CLASSIFICATION_LABELS[scenario.classification]}</dd>
          </div>
        </dl>
      </div>
      <div className="analysis-col analysis-main">
        <h3>{scenario.feedback.summary}</h3>
        <p>{scenario.feedback.explanation}</p>
        <FeedbackMessage scenario={scenario} decision={decision} className="analysis-outcome" />
        {extra && <p className="feedback-extra">{extra}</p>}
        <h4>Lo que conviene mirar</h4>
        <ol className="analysis-signals">
          {scenario.hints.map((h, i) => (
            <li key={h.id}>
              <span className="hint-num" aria-hidden="true">{i + 1}</span>
              {h.text}.
            </li>
          ))}
        </ol>
      </div>
      <div className="analysis-col analysis-actions">
        <h3>
          <ShieldCheck size={20} aria-hidden="true" /> Acción recomendada
        </h3>
        <p>{scenario.feedback.recommendedAction}</p>
        <h3>
          <SearchCheck size={20} aria-hidden="true" /> Cómo verificarlo
        </h3>
        <p>{scenario.feedback.verify}</p>
        {concepts.length > 0 && (
          <>
            <h4>Conceptos relacionados</h4>
            <ul className="analysis-concepts">
              {concepts.map((c) => (
                <li key={c.id}>
                  <Link to={`/conceptos#${c.id}`}>{c.term}</Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
});
