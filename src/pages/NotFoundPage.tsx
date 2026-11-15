import { usePageTitle } from "../lib/usePageTitle.ts"
import { AppLink } from "../components/AppLink.tsx"
import { PageHeader } from "../components/PageHeader.tsx"

export function NotFoundPage() {
  usePageTitle("Página no encontrada — Argos")

  return (
    <div className="wrap wrap-narrow page">
      <PageHeader
        title="Esta página no existe"
        lede="El enlace se fue a un lugar que Argos no tiene. Podés volver al inicio."
      />
      <AppLink className="button button-primary" to="/">
        Ir al inicio
      </AppLink>
    </div>
  )
}
