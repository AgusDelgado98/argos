import { useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle2, GraduationCap } from 'lucide-react';
import type { Outcome } from '../domain/evaluate';

export interface ReviewedCase {
  id: string;
  index: number;
  title: string;
  outcome?: Outcome;
}

interface Props {
  cases: ReviewedCase[];
  challengeCorrect: number;
  challengeTotal: number;
  onBackToSummary: () => void;
  onContinue: () => void;
}

const TAG: Record<Outcome, string> = {
  correct: 'Bien resuelto',
  cautious: 'Buena intuición',
  risky: 'Para mirar otra vez',
};

/** Confirmación breve al terminar el repaso guiado. */
export function ReviewComplete({ cases, challengeCorrect, challengeTotal, onBackToSummary, onContinue }: Props) {
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => title.current?.focus(), []);
  return (
    <section className="card report report-compact review-done" aria-labelledby="review-done-title">
      <p className="report-eyebrow">
        <CheckCircle2 size={18} aria-hidden="true" /> Repaso completado
      </p>
      <h2 id="review-done-title" ref={title} tabIndex={-1}>
        {cases.length === 1 ? 'Repasaste el caso pendiente' : `Repasaste los ${cases.length} casos pendientes`}
      </h2>
      <ul className="review-done-list">
        {cases.map((c) => (
          <li key={c.id}>
            <span className="report-case-num">Caso {c.index + 1}</span>
            <span className="report-case-title">{c.title}</span>
            {c.outcome && <span className="review-done-tag">{TAG[c.outcome]}</span>}
          </li>
        ))}
      </ul>
      <p className="report-cases-note">
        Tu resultado del Desafío no cambia: {challengeCorrect} de {challengeTotal} casos bien resueltos.
      </p>
      <div className="report-compact-actions">
        <button type="button" className="btn btn-primary" onClick={onBackToSummary}>
          <ArrowLeft size={18} aria-hidden="true" /> Volver al resumen del Desafío
        </button>
        <button type="button" className="btn btn-outline" onClick={onContinue}>
          <GraduationCap size={18} aria-hidden="true" /> Seguir practicando en Aprender
        </button>
      </div>
    </section>
  );
}
