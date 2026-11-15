export type Verdict = "seguro" | "phishing"

export const STORAGE_KEY = "argos.phishing:v1"

export type PhishingProgress = {
  version: 1
  answers: Record<string, Verdict>
}

function isVerdict(value: unknown): value is Verdict {
  return value === "seguro" || value === "phishing"
}

export function readProgress(knownIds: readonly string[]): PhishingProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { version: 1, answers: {} }
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== "object" || parsed === null) return { version: 1, answers: {} }
    if ((parsed as { version?: unknown }).version !== 1) return { version: 1, answers: {} }
    const answersIn = (parsed as { answers?: unknown }).answers
    if (typeof answersIn !== "object" || answersIn === null) return { version: 1, answers: {} }
    const source = answersIn as Record<string, unknown>
    const answers: Record<string, Verdict> = {}
    for (const id of knownIds) {
      const value = source[id]
      if (isVerdict(value)) answers[id] = value
    }
    return { version: 1, answers }
  } catch {
    return { version: 1, answers: {} }
  }
}

export function writeProgress(progress: PhishingProgress): void {
  try {
    const answers: Record<string, Verdict> = {}
    for (const [id, verdict] of Object.entries(progress.answers)) {
      if (isVerdict(verdict)) answers[id] = verdict
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, answers }))
  } catch {
    // Safari privado, cuota llena o almacenamiento desactivado.
  }
}
