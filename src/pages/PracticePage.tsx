import { useEffect, useRef, useState } from "react"
import { EMAILS, INBOX_OWNER } from "../data/emails.ts"
import { countClassified, verdictLabel } from "../lib/review.ts"
import type { Verdict } from "../lib/progress.ts"
import { usePageTitle } from "../lib/usePageTitle.ts"
import { useProgress } from "../state/useProgress.ts"
import { AppLink } from "../components/AppLink.tsx"
import { Disclaimer } from "../components/Disclaimer.tsx"
import { EmailBody } from "../components/EmailBody.tsx"
import { Meter } from "../components/Meter.tsx"
import { ModuleFrame } from "../components/ModuleFrame.tsx"
import { PageHeader } from "../components/PageHeader.tsx"

function markLabel(answer: Verdict | undefined): string {
  if (answer === "seguro") return "Marcado: seguro"
  if (answer === "phishing") return "Marcado: phishing"
  return "Sin clasificar"
}

export function PracticePage() {
  const { answers, setAnswer, reset } = useProgress()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState("")
  const [confirmReset, setConfirmReset] = useState(false)
  const backRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  usePageTitle("Phishing: practicar — Argos")

  const done = countClassified(EMAILS, answers)
  const total = EMAILS.length
  const complete = done === total
  const selected = EMAILS.find((email) => email.id === selectedId) ?? null
  const selectedAnswer = selected ? answers[selected.id] : undefined

  useEffect(() => {
    if (!selectedId) return
    if (!window.matchMedia("(max-width: 899px)").matches) return
    backRef.current?.focus()
  }, [selectedId])

  function openEmail(id: string) {
    setSelectedId(id)
    setConfirmReset(false)
  }

  function goBack() {
    const id = selectedId
    setSelectedId(null)
    if (!id) return
    window.requestAnimationFrame(() => {
      itemRefs.current.get(id)?.focus()
    })
  }

  function classify(verdict: Verdict) {
    if (!selected) return
    const already = answers[selected.id] !== undefined
    setAnswer(selected.id, verdict)
    const nextDone = already ? done : done + 1
    const label = verdict === "seguro" ? "seguro" : "phishing"
    setStatusMessage(`Marcaste «${selected.subject}» como ${label}. Van ${nextDone} de ${total}.`)
  }

  function clearAnswers() {
    reset()
    setConfirmReset(false)
    setStatusMessage("Se borraron tus respuestas de este dispositivo.")
  }

  return (
    <ModuleFrame wide>
      <PageHeader
        eyebrow="Módulo 1"
        title="Practicar"
        lede={`Bandeja de ${INBOX_OWNER.name}, una persona inventada. Nada de esto lo envió una empresa real.`}
      />
      <Disclaimer />

      <div className="progress-block">
        <p className="progress-label">
          Clasificados <strong>{done}</strong> de {total}
        </p>
        <Meter done={done} total={total} />
        <p className="hint">Tu avance se guarda solo en este dispositivo.</p>
        <div className="actions">
          {complete ? (
            <AppLink className="button button-primary" to="/phishing/resultado">
              Ver el resultado
            </AppLink>
          ) : (
            <button type="button" className="button button-primary" disabled>
              Ver el resultado
            </button>
          )}
          <p className="hint">
            {complete
              ? "Ya podés ver cómo te fue. Si cambiás una respuesta, el resultado se actualiza."
              : `Te faltan ${total - done} para ver el resultado.`}
          </p>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {statusMessage}
      </p>

      <div className={selected ? "practice is-reading" : "practice"}>
        <div className="inbox-column">
          <h2 className="inbox-title">Bandeja</h2>
          <ul className="mail-list">
            {EMAILS.map((email) => {
              const answer = answers[email.id]
              const current = email.id === selectedId
              return (
                <li key={email.id}>
                  <button
                    type="button"
                    className="mail-button"
                    aria-current={current ? "true" : undefined}
                    ref={(node) => {
                      if (node) itemRefs.current.set(email.id, node)
                      else itemRefs.current.delete(email.id)
                    }}
                    onClick={() => openEmail(email.id)}
                  >
                    <span className="mail-top">
                      <span className="mail-from">{email.fromName}</span>
                      <span className="mail-date">{email.dateLabel}</span>
                    </span>
                    <span className="mail-subject">{email.subject}</span>
                    <span className="mail-preview">{email.preview}</span>
                    <span className={`mail-status ${answer ? "is-marked" : ""}`}>
                      {markLabel(answer)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="reader-column">
          {selected ? (
            <article className="reader" aria-labelledby="correo-abierto">
              <button type="button" className="back-mobile" ref={backRef} onClick={goBack}>
                Volver a la bandeja
              </button>
              <p className="reader-brand">{selected.brand}</p>
              <h2 id="correo-abierto">{selected.subject}</h2>
              <dl className="address-list">
                <div>
                  <dt>De</dt>
                  <dd>
                    <span>{selected.fromName}</span>
                    <code translate="no">{selected.fromAddress}</code>
                  </dd>
                </div>
                <div>
                  <dt>Para</dt>
                  <dd>
                    <span>
                      {INBOX_OWNER.name} (persona inventada)
                    </span>
                    <code translate="no">{INBOX_OWNER.address}</code>
                  </dd>
                </div>
              </dl>
              <p className="hint">
                Tocá un enlace, o pasá el mouse, para ver a dónde iría. No abre ninguna página.
              </p>
              <EmailBody email={selected} />
              <p className="hint">Phishing significa mensaje engañoso.</p>
              <div className="choices" role="group" aria-label="Tu clasificación">
                <button
                  type="button"
                  className="choice choice-safe"
                  aria-pressed={selectedAnswer === "seguro"}
                  onClick={() => classify("seguro")}
                >
                  Es seguro
                </button>
                <button
                  type="button"
                  className="choice choice-phish"
                  aria-pressed={selectedAnswer === "phishing"}
                  onClick={() => classify("phishing")}
                >
                  Es phishing
                </button>
              </div>
              <p className="choice-status">
                {selectedAnswer
                  ? `Marcaste este correo como ${verdictLabel(selectedAnswer)}.`
                  : "Todavía no clasificaste este correo."}
              </p>
            </article>
          ) : (
            <div className="reader reader-empty">
              <h2>Elegí un correo</h2>
              <p>Abrí uno de la bandeja. Después marcá si es seguro o si es phishing.</p>
              <p className="hint">Phishing significa mensaje engañoso.</p>
            </div>
          )}
        </div>
      </div>

      <div className="reset-row">
        {confirmReset ? (
          <div className="confirm-reset">
            <p>¿Borrar todas las respuestas guardadas en este dispositivo?</p>
            <div className="actions">
              <button type="button" className="button button-quiet" onClick={clearAnswers}>
                Sí, borrar
              </button>
              <button type="button" className="button button-ghost" onClick={() => setConfirmReset(false)}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="text-button" onClick={() => setConfirmReset(true)}>
            Borrar mis respuestas
          </button>
        )}
      </div>
    </ModuleFrame>
  )
}
