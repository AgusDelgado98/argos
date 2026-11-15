import type { Difficulty, LabEmail } from "../data/emails.ts"
import type { SignalId } from "../data/signals.ts"
import type { Verdict } from "./progress.ts"

export type EmailReview = {
  email: LabEmail
  answer: Verdict | undefined
  correct: boolean
  missedSignals: readonly SignalId[]
}

export function reviewEmail(email: LabEmail, answer: Verdict | undefined): EmailReview {
  const expected: Verdict = email.isPhishing ? "phishing" : "seguro"
  return {
    email,
    answer,
    correct: answer === expected,
    missedSignals: email.isPhishing && answer !== "phishing" ? email.signals : [],
  }
}

export function reviewAll(
  emails: readonly LabEmail[],
  answers: Readonly<Record<string, Verdict>>,
): EmailReview[] {
  return emails.map((email) => reviewEmail(email, answers[email.id]))
}

export function countClassified(
  emails: readonly LabEmail[],
  answers: Readonly<Record<string, Verdict>>,
): number {
  let count = 0
  for (const email of emails) {
    const answer = answers[email.id]
    if (answer === "seguro" || answer === "phishing") count += 1
  }
  return count
}

export function verdictLabel(verdict: Verdict | undefined): string {
  if (verdict === "seguro") return "Seguro"
  if (verdict === "phishing") return "Phishing"
  return "Sin respuesta"
}

export function difficultyLabel(difficulty: Difficulty): string {
  if (difficulty === "fácil") return "Fácil"
  if (difficulty === "media") return "Media"
  return "Difícil"
}

export function scoreMessage(correct: number, total: number): string {
  if (total === 0) return ""
  if (correct === total) {
    return "Los encontraste todos. Ya estás mirando el dominio y el destino del enlace, que es lo que más importa."
  }
  const ratio = correct / total
  if (ratio >= 0.8) {
    return "Muy bien. Te quedó alguno fino. En «A revisar» está la señal que se pasó."
  }
  if (ratio >= 0.5) {
    return "Vas bien, y todavía se escapan algunos. Volvé a mirar la dirección (lo que está después de la @) y el destino del enlace."
  }
  return "Está bien que cueste: es la primera vez. Mirá de nuevo las señales y volvé a intentar. Conviene leer la dirección real, no solo el nombre de la empresa."
}
