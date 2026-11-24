import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, FolderOpen, Inbox, RotateCcw, ShieldCheck } from 'lucide-react';
import { scenarios, recipient } from './data/scenarios';
import { usePhishingProgress } from './usePhishingProgress';
import { computeStats, getRecord, type Mode } from './domain/progress';
import type { Decision } from './domain/evaluate';
import { InboxList } from './components/InboxList';
import { EmailViewer } from './components/EmailViewer';
import { HintsPanel } from './components/HintsPanel';
import { DecisionBar } from './components/DecisionBar';
import { CaseAnalysis } from './components/CaseAnalysis';
import { ModeSwitch } from './components/ModeSwitch';
import { ChallengeSummary } from './components/ChallengeSummary';
import { ReviewBar } from './components/ReviewBar';
import { ReviewComplete } from './components/ReviewComplete';
import { isReviewComplete, nextPending } from './domain/review';
import { computeChallengeReport } from './domain/report';
import { ProgressSegments } from '../../components/ui/ProgressSegments';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { MOBILE_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import { MobileActionBar } from './components/MobileActionBar';
import { MobileSheet, type SheetView } from './components/MobileSheet';

const IDS = scenarios.map((s) => s.id);

export default function PhishingSimulator() {
  const { progress, actions } = usePhishingProgress();
  const mode = progress.mode;
  const currentId = progress.currentCaseId && IDS.includes(progress.currentCaseId) ? progress.currentCaseId : IDS[0];
  const index = IDS.indexOf(currentId);
  const scenario = scenarios[index];
  const record = getRecord(progress, currentId);
  const answered = record.decision !== undefined;

  // El resaltado pertenece a un caso y modo concretos: al cambiar, se descarta solo.
  const viewKey = `${currentId}-${mode}`;
  const [highlight, setHighlight] = useState<{ key: string; marker: number | null }>({ key: viewKey, marker: null });
  const active = highlight.key === viewKey ? highlight.marker : null;
  const setActive = (marker: number | null) => setHighlight({ key: viewKey, marker });
  const [inboxOpen, setInboxOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | 'all' | 'challenge'>(null);
  const challengeDone = computeStats(progress, IDS, 'challenge').answered === IDS.length;
  // El resumen se muestra al completar el Desafío (y al volver con el Desafío completo).
  const [summaryOpen, setSummaryOpen] = useState(() => progress.mode === 'challenge' && challengeDone);
  const [reviewDoneOpen, setReviewDoneOpen] = useState(false);
  const review = progress.review;
  const inReview = !!review?.active && mode === 'learn' && review.caseIds.includes(currentId);
  const showReviewDone = reviewDoneOpen && mode === 'learn' && isReviewComplete(review);
  const showSummary = summaryOpen && mode === 'challenge' && challengeDone && !showReviewDone;
  const showOverlay = showSummary || showReviewDone;
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [sheet, setSheet] = useState<{ open: boolean; view: SheetView }>({ open: false, view: 'decide' });
  const openSheet = (view: SheetView) => setSheet({ open: true, view });
  const closeSheet = useCallback(() => setSheet((v) => ({ ...v, open: false })), []);
  const analysisRef = useRef<HTMLElement>(null);
  const justAnswered = useRef(false);

  // Marca como visitado el caso abierto (incluido el primero al entrar).
  useEffect(() => {
    if (!record.visited) actions.select(currentId);
  }, [record.visited, currentId, actions]);

  // Después de responder, el foco va al análisis (lectores de pantalla y teclado).
  useEffect(() => {
    if (answered && justAnswered.current && !isMobile) {
      justAnswered.current = false;
      analysisRef.current?.focus();
      analysisRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
    }
  }, [answered, isMobile]);

  const visible = useMemo(() => {
    const total = Math.min(3, scenario.hints.length);
    const count = answered ? total : mode === 'learn' ? Math.min(record.hintsRevealed, total) : 0;
    return new Set(Array.from({ length: count }, (_, i) => i + 1));
  }, [answered, mode, record.hintsRevealed, scenario.hints.length]);

  const stats = computeStats(progress, IDS);
  const done = new Set(
    IDS.map((id, i) => (progress.byMode[mode][id]?.decision ? i : -1)).filter((i) => i >= 0),
  );

  function go(delta: number) {
    const next = IDS[index + delta];
    if (next) {
      actions.select(next);
      setSheet((v) => ({ ...v, open: false }));
      setSummaryOpen(false);
      setReviewDoneOpen(false);
    }
  }

  function select(id: string) {
    actions.select(id);
    setInboxOpen(false);
  }

  function decide(d: Decision) {
    justAnswered.current = true;
    actions.answer(scenario, d);
    if (isMobile) openSheet('feedback');
  }

  function changeMode(m: Mode) {
    if (m !== mode) actions.setMode(m);
    setSummaryOpen(m === 'challenge');
    setReviewDoneOpen(false);
  }

  function openSummary() {
    setSheet((v) => ({ ...v, open: false }));
    setSummaryOpen(true);
    window.scrollTo?.(0, 0);
  }

  function practice(caseId: string) {
    actions.openIn('learn', caseId);
    setSummaryOpen(false);
    window.scrollTo?.(0, 0);
  }

  // Repaso guiado de las respuestas riesgosas del Desafío (en Aprender).
  const reviewIds = computeChallengeReport(progress, scenarios).toReview.map((c) => c.id);
  function startReview() {
    actions.startReview(reviewIds);
    setSummaryOpen(false);
    setReviewDoneOpen(false);
    window.scrollTo?.(0, 0);
  }
  function nextReview() {
    closeSheet();
    actions.nextReview();
    window.scrollTo?.(0, 0);
  }
  function finishReview() {
    closeSheet();
    actions.exitReview();
    setReviewDoneOpen(true);
    window.scrollTo?.(0, 0);
  }
  const reviewStatus =
    review && review.caseIds.join() === reviewIds.join()
      ? { done: review.done.length, total: review.caseIds.length, complete: isReviewComplete(review) }
      : null;

  // Siguiente paso tras responder: en el repaso, el próximo caso pendiente o el cierre;
  // si no, el próximo caso o, si el Desafío quedó completo, el resumen.
  const next = inReview
    ? nextPending(review)
      ? { label: 'Siguiente caso para repasar', run: nextReview }
      : { label: 'Terminar el repaso', run: finishReview }
    : mode === 'challenge' && challengeDone
      ? { label: 'Ver resumen del Desafío', run: openSummary }
      : index < IDS.length - 1
        ? { label: 'Siguiente caso', run: () => go(1) }
        : undefined;

  return (
    <div className={`sim${isMobile ? ' is-mobile' : ''}${showOverlay ? ' is-summary' : ''}`}>
      <div className="container">
        <header className="sim-head">
          <div className="sim-title">
            <FolderOpen size={34} strokeWidth={1.5} aria-hidden="true" />
            <div>
              <h1>
                Detectar engaños<span className="title-suffix"> — Phishing</span>
              </h1>
              <p>
                {showSummary || showReviewDone
                  ? showReviewDone ? 'Repasaste las respuestas para revisar del Desafío.' : 'Terminaste los 12 casos del Desafío. Este es tu resultado.'
                  : 'Analizá el siguiente caso, identificá las señales y decidí qué harías.'}
              </p>
            </div>
          </div>
          {!showOverlay && (
          <div className="case-nav">
            <div>
              <p className="case-count" aria-live="polite">
                Caso {index + 1} de {IDS.length}
              </p>
              <ProgressSegments
                total={IDS.length}
                current={index}
                done={done}
                label={`${stats.answered} de ${IDS.length} casos respondidos en modo ${mode === 'learn' ? 'Aprender' : 'Desafío'}`}
              />
            </div>
            <div className="case-nav-btns">
              <button type="button" className="btn btn-icon" onClick={() => go(-1)} disabled={index === 0} aria-label="Caso anterior">
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="btn btn-icon"
                onClick={() => go(1)}
                disabled={index === IDS.length - 1}
                aria-label="Caso siguiente"
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
          )}
        </header>

        <div className="sim-toolbar">
          <ModeSwitch mode={mode} onChange={changeMode} />
          <div className="sim-toolbar-right">
            {!showOverlay && (
            <>
            <p className="sim-stats">
              {mode === 'learn' ? (
                <>
                  <strong>{stats.answered}</strong>
                  <span className="stats-long"> de {stats.total} resueltos</span>
                  <span className="stats-short" aria-hidden="true">/{stats.total}</span>
                </>
              ) : (
                <>
                  <span className="stats-long">Puntaje: </span>
                  <strong>{stats.correct}</strong> / {stats.answered}
                  <span className="stats-long"> respondidos</span>
                  <span className="stats-short" aria-hidden="true"> pts</span>
                </>
              )}
            </p>
            <button
              type="button"
              className="btn btn-ghost btn-sm inbox-toggle"
              aria-expanded={inboxOpen}
              aria-controls="bandeja"
              onClick={() => setInboxOpen((v) => !v)}
            >
              <Inbox size={16} aria-hidden="true" /> <span className="btn-label">{inboxOpen ? 'Ocultar bandeja' : 'Ver bandeja'}</span>
            </button>
            </>
            )}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm('all')}>
              <RotateCcw size={16} aria-hidden="true" /> <span className="btn-label">Reiniciar progreso</span>
            </button>
          </div>
        </div>

        <p className="sim-safety">
          <ShieldCheck size={16} aria-hidden="true" /> Simulación ficticia: los correos, marcas y dominios son inventados y los
          enlaces no se abren.
        </p>

        {inReview && review && (
          <ReviewBar position={review.caseIds.indexOf(currentId) + 1} total={review.caseIds.length} onExit={actions.exitReview} />
        )}

        {showReviewDone && review ? (
          <ReviewComplete
            cases={review.caseIds.map((id) => {
              const sc = scenarios.find((x) => x.id === id)!;
              return { id, index: IDS.indexOf(id), title: sc.title, outcome: progress.byMode.learn[id]?.outcome };
            })}
            challengeCorrect={computeStats(progress, IDS, 'challenge').correct}
            challengeTotal={IDS.length}
            onBackToSummary={() => changeMode('challenge')}
            onContinue={() => setReviewDoneOpen(false)}
          />
        ) : showSummary ? (
          <ChallengeSummary
            report={computeChallengeReport(progress, scenarios)}
            review={reviewStatus}
            onReview={startReview}
            onPractice={practice}
            onRestart={() => setConfirm('challenge')}
            onClose={() => setSummaryOpen(false)}
          />
        ) : (
        <>
        <div className="sim-grid">
          <InboxList
            scenarios={scenarios}
            currentId={currentId}
            records={progress.byMode[mode]}
            onSelect={select}
            open={inboxOpen}
          />
          <div className="sim-mail">
            <EmailViewer scenario={scenario} recipientName={recipient.name} visible={visible} active={active} />
          </div>
          {!isMobile && (
          <HintsPanel
            key={viewKey}
            scenario={scenario}
            mode={mode}
            revealed={record.hintsRevealed}
            answered={answered}
            active={active}
            onReveal={() => actions.revealHint(scenario)}
            onFocusHint={setActive}
          />
          )}
        </div>

        {!isMobile && (
        <DecisionBar
          mode={mode}
          decision={record.decision}
          onDecide={decide}
          onRetry={() => actions.retry(currentId)}
          onNext={next?.run}
          nextLabel={next?.label}
        />
        )}

        {!isMobile && answered && record.decision && record.outcome && (
          <CaseAnalysis ref={analysisRef} scenario={scenario} decision={record.decision} outcome={record.outcome} />
        )}

        </>
        )}
      </div>

      {isMobile && !showOverlay && (
        <>
          <MobileActionBar
            mode={mode}
            answered={answered}
            hintsShown={Math.min(record.hintsRevealed, 3)}
            hintsTotal={Math.min(3, scenario.hints.length)}
            onHints={() => openSheet('hints')}
            onRespond={() => openSheet('decide')}
            onFeedback={() => openSheet('feedback')}
            onNext={next?.run}
            nextLabel={next?.label}
          />
          <MobileSheet
            open={sheet.open}
            view={answered ? 'feedback' : sheet.view === 'feedback' ? 'decide' : sheet.view}
            scenario={scenario}
            mode={mode}
            record={record}
            onClose={closeSheet}
            onView={(view) => setSheet({ open: true, view })}
            onDecide={decide}
            onReveal={() => actions.revealHint(scenario)}
            onRetry={() => {
              actions.retry(currentId);
              setSheet({ open: true, view: 'decide' });
            }}
            onNext={next?.run}
            nextLabel={next?.label}
          />
        </>
      )}

      <ConfirmDialog
        open={confirm === 'all'}
        title="¿Reiniciar progreso?"
        message="Se borrarán tus respuestas y pistas de los modos Aprender y Desafío en este navegador. Esta acción no se puede deshacer."
        confirmLabel="Sí, reiniciar"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          actions.reset();
          setConfirm(null);
          setSummaryOpen(false);
        }}
      />
      <ConfirmDialog
        open={confirm === 'challenge'}
        title="¿Volver a intentar el Desafío?"
        message="Se borran solo tus respuestas del Desafío para empezar de nuevo desde el caso 1. Lo que practicaste en Aprender se conserva."
        confirmLabel="Empezar de nuevo"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          actions.restartChallenge(IDS[0]);
          setConfirm(null);
          setSummaryOpen(false);
          window.scrollTo?.(0, 0);
        }}
      />
    </div>
  );
}
