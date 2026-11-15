import { useContext } from "react"
import type { ProgressApi } from "./progress-context.ts"
import { ProgressContext } from "./progress-context.ts"

export function useProgress(): ProgressApi {
  const value = useContext(ProgressContext)
  if (!value) {
    throw new Error("useProgress tiene que usarse dentro de ProgressProvider")
  }
  return value
}
