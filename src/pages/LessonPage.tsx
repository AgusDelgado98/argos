import { LAB_BRANDS, officialDomain } from "../data/brands.ts"
import { SIGNAL_IDS, SIGNALS } from "../data/signals.ts"
import { usePageTitle } from "../lib/usePageTitle.ts"
import { AppLink } from "../components/AppLink.tsx"
import { Disclaimer } from "../components/Disclaimer.tsx"
import { FakeLink } from "../components/FakeLink.tsx"
import { ModuleFrame } from "../components/ModuleFrame.tsx"
import { PageHeader } from "../components/PageHeader.tsx"

export function LessonPage() {
  usePageTitle("Phishing: aprender — Argos")

  return (
    <ModuleFrame>
      <PageHeader
        eyebrow="Módulo 1"
        title="Qué es el phishing"
        lede="Es un mensaje falso que se hace pasar por una empresa, un banco o alguien conocido para que hagas clic, pases datos o abras un archivo."
      />
      <p>
        El nombre viene del inglés <em>fishing</em>, pescar. Te tiran un anzuelo. No hace falta
        ser experto para verlo: alcanza con mirar despacio algunas señales.
      </p>

      <section aria-labelledby="otros-canales">
        <h2 id="otros-canales">No llega solo por correo</h2>
        <p>
          El mismo engaño llega por mensaje de texto (SMS) y por WhatsApp. A veces también es una
          llamada. Cambian el canal, no el truco: alguien se hace pasar por otro y te apura para
          que actúes.
        </p>
      </section>

      <section aria-labelledby="senales">
        <h2 id="senales">Señales para mirar</h2>
        <ul className="signal-list">
          {SIGNAL_IDS.map((id) => (
            <li key={id} className="signal-card">
              <h3>{SIGNALS[id].title}</h3>
              <p>{SIGNALS[id].plain}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="como-mirar">
        <h2 id="como-mirar">Cómo mirar un enlace</h2>
        <p>
          El nombre que ves arriba («Mercado Libre», «Netflix») puede ser cualquiera. Lo que
          importa es la dirección, la parte que está después de la @, y a dónde va el enlace de
          verdad.
        </p>
        <p>
          En un correo real, si apoyás el mouse o mantenés el dedo sobre un enlace, el celular o
          la compu muestran el destino. Acá es igual: tocá el enlace (o pasá el mouse) y vas a
          verlo. <strong>No abre ninguna página.</strong>
        </p>
        <p>Este ejemplo no está en la bandeja:</p>
        <FakeLink
          label="Ir a Mercado Libre"
          destination="https://mercadolibre-acceso.example/login"
          brandName="Mercado Libre"
          officialDomain={officialDomain("Mercado Libre")}
        />
        <p>
          El texto dice Mercado Libre, pero el destino es otro sitio. Por eso no alcanza con leer
          el botón.
        </p>
      </section>

      <section aria-labelledby="dominios">
        <h2 id="dominios">Dominios de esta práctica</h2>
        <p>
          En Argos ninguna dirección existe en internet. Terminan en <strong>.example</strong> o
          en <strong>.invalid</strong>, dos finales reservados que no se pueden visitar. Así nadie
          llega a un sitio de verdad por error.
        </p>
        <p>
          Ojo: <strong>.example no significa «seguro»</strong>. Lo usamos en los dominios de
          práctica y también en algunos engaños. <strong>.invalid</strong> también es falso. Lo
          que tenés que comparar es el nombre de adelante: una letra cambiada, un guion o
          palabras de más ya son otro sitio.
        </p>
        <div className="table-scroll">
          <table className="domain-table">
            <caption>Dominios oficiales de esta práctica. Son inventados.</caption>
            <thead>
              <tr>
                <th scope="col">Marca</th>
                <th scope="col">Dominio de práctica</th>
              </tr>
            </thead>
            <tbody>
              {LAB_BRANDS.map((brand) => (
                <tr key={brand.domain}>
                  <th scope="row">{brand.name}</th>
                  <td>
                    <code translate="no">{brand.domain}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          En la vida real esas empresas no usan .example. Mercado Libre usa mercadolibre.com,
          Mercado Pago usa mercadopago.com, Banco Galicia usa bancogalicia.com.ar, Netflix usa
          netflix.com y Correo Argentino usa correoargentino.com.ar. El atacante intenta parecerse
          a esa dirección. Esta lista sirve solo para el ejercicio: la habilidad es comparar, no
          memorizar.
        </p>
        <p>Una misma marca puede escribirte de verdad o pueden imitarla. Mirá cada mensaje, no el nombre grande.</p>
      </section>

      <Disclaimer />
      <p className="actions">
        <AppLink className="button button-primary" to="/phishing/practicar">
          Empezar a practicar
        </AppLink>
      </p>
    </ModuleFrame>
  )
}
