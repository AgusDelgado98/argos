import { useEffect, useRef, useState, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Award, BarChart3, BookOpen, Eye, GraduationCap, Inbox, RotateCcw, Sparkles } from 'lucide-react';
import type { CaseRef, ChallengeReport, CategoryResult } from '../domain/report';
import { CATEGORY_INFO } from '../domain/categories';
import { getConcept } from '../../theory/glossary';

export interface ReviewStatus {
  done: number;
  total: number;
  complete: boolean;
}

interface Props {
  report: ChallengeReport;
  /** Estado del repaso guiado de las respuestas para revisar, si ya empezó. */
  review?: ReviewStatus | null;
  /** Inicia o retoma el repaso guiado de las respuestas para revisar. */
  onReview: () => void;
  onPractice: (caseId: string) => void;
  onRestart: () => void;
  onClose: () => void;
}

const LEADS: Record<ChallengeReport['tone'], string> = {
  excelente: 'Muy buen ojo: resolviste bien la mayoría de los casos sin pistas.',
  'muy-bien': 'Vas muy bien: resolviste bien varios casos sin ayuda.',
  comienzo: 'Buen comienzo: cada caso que repasás entrena tu observación.',
};

const OUTCOME_TAG: Record<CaseRef['outcome'], string> = {
  correct: 'Bien resuelto',
  cautious: 'Respuesta prudente',
  risky: 'Para revisar',
};

function Meter({ c }: { c: CategoryResult }) {
  return (
    <span className="meter" aria-hidden="true">
      {Array.from({ length: c.total }, (_, i) => (
        <span key={i} className={i < c.correct ? 'is-full' : i < c.correct + c.cautious ? 'is-half' : ''} />
      ))}
    </span>
  );
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

function listNums(nums: number[]) {
  return nums.length === 1 ? `el caso ${nums[0]}` : `los casos ${nums.slice(0, -1).join(', ')} y ${nums[nums.length - 1]}`;
}

/** Acción principal del resumen según lo que haya para repasar (0, 1 o varios casos). */
function primaryAction({ report, review, onReview, onPractice, onRestart }: Props) {
  const nums = report.toReview.map((c) => c.index + 1);
  if (nums.length > 0) {
    if (review && !review.complete && review.done > 0) {
      return {
        label: 'Continuar el repaso',
        icon: GraduationCap,
        run: onReview,
        note: `Llevás ${review.done} de ${review.total} casos repasados.`,
      };
    }
    return {
      label: 'Repasar estos casos',
      icon: GraduationCap,
      run: onReview,
      note: review?.complete
        ? `Ya repasaste ${listNums(nums)}. Podés volver a hacerlo cuando quieras.`
        : nums.length === 1
          ? `Repasás el caso ${nums[0]} en modo Aprender.`
          : `Repasás ${listNums(nums)} en modo Aprender, uno por vez.`,
    };
  }
  const related = report.prudent[0];
  if (related) {
    return {
      label: 'Practicar casos relacionados',
      icon: GraduationCap,
      run: () => onPractice(related.id),
      note: `No hubo respuestas riesgosas. Podés practicar el caso ${related.index + 1}, donde respondiste con prudencia.`,
    };
  }
  return {
    label: 'Volver a intentar el Desafío',
    icon: RotateCcw,
    run: onRestart,
    note: 'No hubo respuestas riesgosas ni prudentes para repasar.',
  };
}

/**
 * Cierre del Desafío en dos niveles:
 * 1) resumen inmediato y compacto; 2) análisis completo, solo si se pide.
 */
export function ChallengeSummary(props: Props) {
  const [view, setView] = useState<'summary' | 'analysis'>('summary');
  const firstRender = useRef(true);
  const analysisTitle = useRef<HTMLHeadingElement>(null);
  const toAnalysis = useRef<HTMLButtonElement>(null);

  // Al cambiar de nivel, el foco va al título del análisis o vuelve al botón que lo abrió.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo?.(0, 0);
    if (view === 'analysis') analysisTitle.current?.focus();
    else toAnalysis.current?.focus();
  }, [view]);

  return view === 'summary' ? (
    <SummaryView {...props} onAnalysis={() => setView('analysis')} analysisRef={toAnalysis} />
  ) : (
    <AnalysisView {...props} onBack={() => setView('summary')} titleRef={analysisTitle} />
  );
}

/** Nivel 1: resultado general, desglose, una recomendación y dos acciones. */
function SummaryView({
  onAnalysis,
  analysisRef,
  ...props
}: Props & { onAnalysis: () => void; analysisRef: RefObject<HTMLButtonElement | null> }) {
  const { stats, focusCategory, tone } = props.report;
  const focus = focusCategory ? CATEGORY_INFO[focusCategory] : null;
  const primary = primaryAction(props);
  return (
    <section className="card report report-compact" aria-labelledby="report-title">
      <p className="report-eyebrow">
        <Award size={18} aria-hidden="true" /> Desafío completado
      </p>
      <h2 id="report-title">Tu recorrido de observación</h2>
      <p className="report-total">
        <strong>{stats.correct}</strong>
        <span> de {stats.total} casos bien resueltos</span>
      </p>
      <p className="report-lead">{LEADS[tone]}</p>
      <ul className="report-score" aria-label="Resultado">
        <li>
          <span className="dot is-full" aria-hidden="true" />
          <strong>{stats.correct}</strong> bien resueltos
        </li>
        <li>
          <span className="dot is-half" aria-hidden="true" />
          <strong>{stats.cautious}</strong> con buena intuición
        </li>
        <li>
          <span className="dot" aria-hidden="true" />
          <strong>{stats.risky}</strong> para revisar
        </li>
      </ul>

      <div className="report-tip" role="note" aria-label="Recomendación">
        <Sparkles size={18} aria-hidden="true" />
        {focus ? (
          <p>
            <strong>Tu próximo paso: {focus.label}.</strong> {focus.tip}
          </p>
        ) : (
          <p>
            <strong>¡Todo bien resuelto!</strong> Volvé a intentarlo más adelante para sostener lo que practicaste.
          </p>
        )}
      </div>

      <div className="report-compact-actions">
        <button type="button" className="btn btn-primary" onClick={primary.run} aria-describedby="report-cases-note">
          <primary.icon size={18} aria-hidden="true" /> {primary.label}
        </button>
        <button type="button" className="btn btn-outline" onClick={onAnalysis} ref={analysisRef}>
          <BarChart3 size={18} aria-hidden="true" /> Ver mi análisis completo
        </button>
      </div>
      <p id="report-cases-note" className="report-cases-note">
        {primary.note}
      </p>
    </section>
  );
}

/** Nivel 2: análisis completo por tipo de señal, con revisión y práctica. */
function AnalysisView({
  report,
  onReview,
  onPractice,
  onRestart,
  onClose,
  onBack,
  titleRef,
}: Props & { onBack: () => void; titleRef: RefObject<HTMLHeadingElement | null> }) {
  const { categories, toReview, practice, firstReviewCaseId } = report;
  return (
    <section className="card report" aria-labelledby="analysis-title">
      <div className="report-analysis-head">
        <button type="button" className="btn btn-ghost btn-sm report-back" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" /> Volver al resumen
        </button>
        <h2 id="analysis-title" ref={titleRef} tabIndex={-1}>
          Tu análisis completo
        </h2>
      </div>

      <div className="report-grid">
        <section className="report-block report-learned" aria-labelledby="report-learned">
          <h3 id="report-learned">
            <Sparkles size={20} aria-hidden="true" /> Cómo te fue por tipo de señal
          </h3>
          <p className="report-note">Estimado a partir de tus respuestas en los casos donde aparece cada señal.</p>
          <ul className="report-strengths">
            {categories.map((c) => (
              <li key={c.id}>
                <div className="report-row">
                  <strong>{c.label}</strong>
                  <Meter c={c} />
                </div>
                <p className="report-row-count">
                  {c.correct} de {plural(c.total, 'caso bien resuelto', 'casos bien resueltos')}
                  {c.cautious > 0 && ` · ${plural(c.cautious, 'prudente', 'prudentes')}`}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="report-block report-review-block" aria-labelledby="report-review">
          <h3 id="report-review">
            <Eye size={20} aria-hidden="true" /> Para repasar
          </h3>

          <section className="report-sub" aria-labelledby="report-to-review">
            <h4 id="report-to-review">
              Respuestas para revisar <span className="report-item-count">{toReview.length}</span>
            </h4>
            {toReview.length === 0 ? (
              <p className="report-empty">No hubo respuestas riesgosas en este Desafío.</p>
            ) : (
              <ul className="report-cases">
                {toReview.map((rc) => (
                  <li key={rc.id}>
                    <button type="button" className="report-case" onClick={() => onPractice(rc.id)}>
                      <span className="report-case-num">Caso {rc.index + 1}</span>
                      <span className="report-case-text">
                        <span className="report-case-title">{rc.title}</span>
                        <span className="report-case-meta">
                          Señales del caso: {rc.categories.map((c) => CATEGORY_INFO[c].label).join(', ')}
                        </span>
                      </span>
                      <span className="visually-hidden">: repasar en modo Aprender</span>
                      <ArrowRight size={16} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {practice.length > 0 && (
            <section className="report-sub" aria-labelledby="report-practice">
              <h4 id="report-practice">Para practicar más</h4>
              <p className="report-note">Casos relacionados con esas señales. No son errores: sirven para seguir entrenando.</p>
              <div className="report-review">
                {practice.map((t) => {
                  const concept = getConcept(CATEGORY_INFO[t.id].conceptId);
                  return (
                    <details key={t.id} className="report-item is-practice">
                      <summary>
                        <span className="report-item-label">{t.label}</span>
                        <span className="report-item-count is-neutral">
                          {plural(t.cases.length, 'caso relacionado', 'casos relacionados')}
                        </span>
                      </summary>
                      <div className="report-item-body">
                        <p>{CATEGORY_INFO[t.id].tip}</p>
                        <ul className="report-cases">
                          {t.cases.map((rc) => (
                            <li key={rc.id}>
                              <button type="button" className="report-case is-neutral" onClick={() => onPractice(rc.id)}>
                                <span className="report-case-num">Caso {rc.index + 1}</span>
                                <span className="report-case-text">
                                  <span className="report-case-title">{rc.title}</span>
                                  <span className="report-case-meta">{OUTCOME_TAG[rc.outcome]}</span>
                                </span>
                                <span className="visually-hidden">: practicar en modo Aprender</span>
                                <ArrowRight size={16} aria-hidden="true" />
                              </button>
                            </li>
                          ))}
                        </ul>
                        {concept && (
                          <Link to={`/conceptos#${concept.id}`} className="report-concept">
                            <BookOpen size={15} aria-hidden="true" /> Ver concepto: {concept.term}
                          </Link>
                        )}
                      </div>
                    </details>
                  );
                })}
              </div>
            </section>
          )}
        </section>

        <section className="report-next" aria-labelledby="report-next">
          <h3 id="report-next">Seguí practicando</h3>
          <div className="report-actions">
            {firstReviewCaseId && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => (toReview.length > 0 ? onReview() : onPractice(firstReviewCaseId))}
              >
                <GraduationCap size={18} aria-hidden="true" /> Repasar en Aprender
              </button>
            )}
            <button type="button" className="btn btn-outline" onClick={onRestart}>
              <RotateCcw size={18} aria-hidden="true" /> Volver a intentar el Desafío
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              <Inbox size={18} aria-hidden="true" /> Ver la bandeja
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
