import { useNavigate } from "react-router"
import { EMAILS } from "../data/emails.ts"
import { SIGNALS } from "../data/signals.ts"
import {
  countClassified,
  difficultyLabel,
  reviewAll,
  scoreMessage,
  verdictLabel,
} from "../lib/review.ts"
import type { EmailReview } from "../lib/review.ts"
import { usePageTitle } from "../lib/usePageTitle.ts"
import { useProgress } from "../state/useProgress.ts"
import { AppLink } from "../components/AppLink.tsx"
import { Disclaimer } from "../components/Disclaimer.tsx"
import { ModuleFrame } from "../components/ModuleFrame.tsx"
import { PageHeader } from "../components/PageHeader.tsx"
import { RealWorldAdvice } from "../components/RealWorldAdvice.tsx"

function orderedReviews(reviews: readonly EmailReview[]): EmailReview[] {
  const pending = reviews.filter((review) => !review.correct)
  const done = reviews.filter((review) => review.correct)
  return [...pending, ...done]
}

function ReviewCard({ review }: { review: EmailReview }) {
  const { email, answer, correct, missedSignals } = review
  return (
    <li className={correct ? "review is-correct" : "review is-wrong"}>
      <p className="review-kicker">
        {email.brand} · Dificultad {difficultyLabel(email.difficulty)}
      </p>
      <h3>{email.subject}</h3>
      <p className="review-verdict">
        <span className={correct ? "tag tag-ok" : "tag tag-miss"}>
          {correct ? "Acertaste" : "A revisar"}
        </span>
        <span>
          Tu respuesta: {verdictLabel(answer)}. Era: {email.isPhishing ? "Phishing" : "Seguro"}.
        </span>
      </p>
      <p>{email.why}</p>
      {email.trap ? <p className="trap">Para la próxima: {email.trap}</p> : null}
      {email.isPhishing ? (
        <>
          <h4>{missedSignals.length > 0 ? "Señales que se te pasaron" : "Señales que estaban"}</h4>
          <ul>
            {email.signals.map((id) => (
              <li key={id}>
                <strong>{SIGNALS[id].title}.</strong> {SIGNALS[id].plain}
                {missedSignals.includes(id) ? <span className="missed-tag"> Se te pasó.</span> : null}
              </li>
            ))}
          </ul>
          {missedSignals.length === 0 ? <p>No se te pasó ninguna de estas.</p> : null}
        </>
      ) : (
        <>
          <h4>{correct ? "Pistas de que era seguro" : "Esto se te pasó: era seguro"}</h4>
          <ul>
            {email.safeCues.map((cue) => (
              <li key={cue}>{cue}</li>
            ))}
          </ul>
          {correct ? null : (
            <p>No había señales de phishing. Lo marcaste como phishing.</p>
          )}
        </>
      )}
    </li>
  )
}

export function ResultsPage() {
  const { answers, reset } = useProgress()
  const navigate = useNavigate()
  usePageTitle("Phishing: resultado — Argos")

  const total = EMAILS.length
  const done = countClassified(EMAILS, answers)
  const complete = done === total
  const reviews = reviewAll(EMAILS, answers)
  const correct = reviews.filter((review) => review.correct).length

  function again() {
    reset()
    void navigate("/phishing/practicar")
  }

  if (!complete) {
    return (
      <ModuleFrame>
        <PageHeader
          eyebrow="Módulo 1"
          title="Todavía no"
          lede={`Clasificaste ${done} de ${total}. Cuando termines, vas a ver el puntaje y qué señales se te pasaron.`}
        />
        <p className="actions">
          <AppLink className="button button-primary" to="/phishing/practicar">
            Volver a la bandeja
          </AppLink>
        </p>
        <Disclaimer />
        <RealWorldAdvice />
      </ModuleFrame>
    )
  }

  const missed = total - correct

  return (
    <ModuleFrame>
      <PageHeader
        eyebrow="Módulo 1"
        title="Tu resultado"
        lede={scoreMessage(correct, total)}
      />
      <p className="score" aria-label={`${correct} de ${total} correctos`}>
        <span className="score-number">{correct}</span>
        <span className="score-total">de {total}</span>
      </p>
      <p>
        {missed === 0
          ? "No se te pasó ninguna señal de los correos falsos."
          : `A revisar: ${missed}. Esos aparecen primero.`}
      </p>
      <Disclaimer />
      <RealWorldAdvice />
      <section aria-labelledby="correo-por-correo">
        <h2 id="correo-por-correo">Correo por correo</h2>
        <ol className="reviews">
          {orderedReviews(reviews).map((review) => (
            <ReviewCard key={review.email.id} review={review} />
          ))}
        </ol>
      </section>
      <div className="actions">
        <button type="button" className="button button-primary" onClick={again}>
          Practicar de nuevo
        </button>
        <AppLink className="button button-ghost" to="/phishing">
          Volver a la lección
        </AppLink>
      </div>
      <p className="hint">Estas respuestas están guardadas en este dispositivo. Si borrás los datos del navegador, se pierden.</p>
    </ModuleFrame>
  )
}
