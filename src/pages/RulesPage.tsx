import { usePageTitle } from "../lib/usePageTitle.ts"
import { PageHeader } from "../components/PageHeader.tsx"

export function RulesPage() {
  usePageTitle("Reglas — Argos")

  return (
    <div className="wrap wrap-narrow page">
      <PageHeader
        eyebrow="Ética"
        title="Reglas completas"
        lede="Argos es un proyecto educativo y defensivo. Sirve para entender los engaños y frenarlos, nunca para usarlos contra nadie."
      />
      <p className="hint">Estas son las reglas del proyecto. También están en el archivo ETICA.md del repositorio.</p>

      <section aria-labelledby="regla-de-oro">
        <h2 id="regla-de-oro">Regla de oro</h2>
        <p>
          <strong>Todo se simula en un lugar cerrado.</strong> Nada de Argos se usa contra
          sistemas, redes, cuentas o personas reales que no sean tuyos y que no controles por
          completo.
        </p>
      </section>

      <section aria-labelledby="lo-que-hace">
        <h2 id="lo-que-hace">Lo que Argos hace</h2>
        <ul>
          <li>Explica cómo funcionan las amenazas con ejemplos inventados y controlados.</li>
          <li>Corre en tu navegador o en tu compu, aislado y sin salir a internet.</li>
          <li>
            Más adelante puede entrenar modelos de detección con datasets públicos, citando a sus
            autores. Esa parte todavía no está en esta app.
          </li>
        </ul>
      </section>

      <section aria-labelledby="lo-que-no-hace">
        <h2 id="lo-que-no-hace">Lo que Argos no hace</h2>
        <ul>
          <li>No envía correos de phishing ni contacta a ninguna persona.</li>
          <li>No prueba contraseñas contra servicios reales.</li>
          <li>No publica servidores vulnerables a propósito en internet.</li>
          <li>No incluye exploits, payloads ni herramientas para atacar.</li>
          <li>No descarga, ejecuta ni reparte malware real.</li>
          <li>No usa redes, datos ni cuentas de trabajo o de otras personas para experimentar.</li>
        </ul>
      </section>

      <section aria-labelledby="ley">
        <h2 id="ley">La ley, en simple</h2>
        <p>
          En Argentina, entrar sin permiso a un sistema o a datos informáticos es un delito. Lo
          dice la Ley 26.388, que modificó el Código Penal. En muchos otros países hay leyes
          parecidas.
        </p>
        <p>Este texto no es asesoramiento legal: marca el límite del proyecto.</p>
      </section>

      <section aria-labelledby="datasets">
        <h2 id="datasets">Datasets, para cuando exista el laboratorio de datos</h2>
        <ul>
          <li>
            <strong>CIC-IDS2017:</strong> se puede usar citando a Sharafaldin, Lashkari y Ghorbani
            (ICISSP 2018).
          </li>
          <li>
            <strong>UNSW-NB15:</strong> solo uso académico o de investigación, sin uso comercial.
            Citar a Moustafa y Slay.
          </li>
        </ul>
      </section>

      <section aria-labelledby="problema">
        <h2 id="problema">Si ves un problema</h2>
        <p>
          Si algo en Argos se pudiera usar para dañar a alguien, hay que corregirlo. Avisalo en el
          repositorio del proyecto.
        </p>
      </section>

      <section aria-labelledby="en-esta-app">
        <h2 id="en-esta-app">En esta app</h2>
        <p>
          Los correos del módulo de phishing son inventados. Las marcas que se nombran no tienen
          relación con Argos y no enviaron esos mensajes. Tu avance se guarda solo en este
          dispositivo.
        </p>
      </section>
    </div>
  )
}
