import { createContext } from "react"
import type { Verdict } from "../lib/progress.ts"

export type ProgressApi = {
  answers: Readonly<Record<string, Verdict>>
  setAnswer: (id: string, verdict: Verdict) => void
  reset: () => void
}

export const ProgressContext = createContext<ProgressApi | null>(null)
