import { MODULES } from "../data/modules.ts"
import { usePageTitle } from "../lib/usePageTitle.ts"
import { AppLink } from "../components/AppLink.tsx"
import { EyeMark } from "../components/EyeMark.tsx"

export function HomePage() {
  usePageTitle("Argos — aprender a detectar engaños")

  return (
    <div className="wrap wrap-narrow page">
      <header className="hero">
        <EyeMark className="hero-eye" />
        <p className="eyebrow">Laboratorio para aprender a mirar</p>
        <h1>Argos</h1>
        <p className="lede">Cien ojos para mirar con calma.</p>
      </header>

      <section aria-labelledby="que-es">
        <h2 id="que-es">Qué es</h2>
        <p>
          Argos Panoptes era un gigante de los mitos griegos. Tenía cien ojos. Cuando dormía,
          cerraba solo algunos: siempre quedaba alguno abierto, mirando.
        </p>
        <p>
          Esta app hace eso, despacio y sin asustar. Te ayuda a <strong>mirar</strong>,{" "}
          <strong>detectar</strong> y <strong>entender</strong> engaños digitales. No sirve para
          atacar. Todo lo que practicás es inventado y se queda en tu celular o en tu compu.
        </p>
      </section>

      <section className="ethics-card" aria-labelledby="reglas-corto">
        <h2 id="reglas-corto">Reglas, en corto</h2>
        <ul>
          <li>Todo es una simulación. Nada sale de este dispositivo.</li>
          <li>No se envían correos, no se prueban contraseñas reales y no hay virus de verdad.</li>
          <li>Si algo se pudiera usar para dañar, hay que corregirlo.</li>
        </ul>
        <p>
          <AppLink to="/reglas">Leer las reglas completas</AppLink>
        </p>
      </section>

      <section aria-labelledby="como">
        <h2 id="como">Cómo se usa</h2>
        <ol className="steps">
          <li>
            <strong>Aprender.</strong> Una explicación corta. No hace falta saber nada de antes.
          </li>
          <li>
            <strong>Practicar.</strong> Una bandeja de correos inventados. Vos marcás cada uno
            como seguro o como phishing.
          </li>
          <li>
            <strong>Ver el resultado.</strong> El puntaje y, correo por correo, qué señales había
            y cuáles se te pasaron.
          </li>
        </ol>
      </section>

      <section aria-labelledby="modulos">
        <h2 id="modulos">Módulos</h2>
        <ul className="module-list">
          {MODULES.map((module) => (
            <li key={module.id}>
              {module.status === "disponible" && module.to ? (
                <article className="module-card is-open">
                  <p className="badge badge-live">Disponible</p>
                  <h3>{module.title}</h3>
                  <p>{module.summary}</p>
                  <AppLink className="button button-primary" to={module.to}>
                    Empezar
                  </AppLink>
                </article>
              ) : (
                <article className="module-card">
                  <p className="badge">Próximamente</p>
                  <h3>{module.title}</h3>
                  <p>{module.summary}</p>
                </article>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
