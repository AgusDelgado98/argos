import { useCallback, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { EMAILS } from "../data/emails.ts"
import { readProgress, writeProgress } from "../lib/progress.ts"
import type { Verdict } from "../lib/progress.ts"
import { ProgressContext } from "./progress-context.ts"

const KNOWN_IDS = EMAILS.map((email) => email.id)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Record<string, Verdict>>(
    () => readProgress(KNOWN_IDS).answers,
  )

  useEffect(() => {
    writeProgress({ version: 1, answers })
  }, [answers])

  const setAnswer = useCallback((id: string, verdict: Verdict) => {
    if (!KNOWN_IDS.includes(id)) return
    setAnswers((current) => {
      if (current[id] === verdict) return current
      return { ...current, [id]: verdict }
    })
  }, [])

  const reset = useCallback(() => {
    setAnswers({})
  }, [])

  const value = useMemo(
    () => ({ answers, setAnswer, reset }),
    [answers, setAnswer, reset],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}
