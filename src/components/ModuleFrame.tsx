import type { ReactNode } from "react"
import { Stepper } from "./Stepper.tsx"

export function ModuleFrame({ wide, children }: { wide?: boolean; children: ReactNode }) {
  return (
    <div className={wide ? "wrap page" : "wrap wrap-narrow page"}>
      <Stepper />
      {children}
    </div>
  )
}
