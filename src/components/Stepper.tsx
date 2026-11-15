import { useLocation } from "react-router"
import { EMAILS } from "../data/emails.ts"
import { countClassified } from "../lib/review.ts"
import { useProgress } from "../state/useProgress.ts"
import { AppNavLink } from "./AppLink.tsx"

const STEPS = [
  { to: "/phishing", label: "Aprender", number: "1" },
  { to: "/phishing/practicar", label: "Practicar", number: "2" },
  { to: "/phishing/resultado", label: "Resultado", number: "3" },
] as const

function stepClass({ isActive }: { isActive: boolean }) {
  return isActive ? "step is-active" : "step"
}

export function Stepper() {
  const { pathname } = useLocation()
  const { answers } = useProgress()
  const complete = countClassified(EMAILS, answers) === EMAILS.length

  return (
    <nav aria-label="Pasos del módulo">
      <ol className="stepper">
        {STEPS.map((step) => {
          const current = pathname === step.to
          if (step.to === "/phishing/resultado" && !complete) {
            return (
              <li key={step.to} aria-current={current ? "step" : undefined}>
                <span className="step is-locked">{step.number}. {step.label}
                  <span className="sr-only">
                    . Disponible cuando clasifiques todos los correos.
                  </span>
                </span>
              </li>
            )
          }
          return (
            <li key={step.to}>
              <AppNavLink
                to={step.to}
                end
                className={stepClass}
                aria-current={current ? "step" : undefined}
              >
                {step.number}. {step.label}
              </AppNavLink>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
