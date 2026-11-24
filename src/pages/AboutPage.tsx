import { Link } from 'react-router-dom';
import { Eye, Lock, Scale, ShieldCheck, TriangleAlert } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="container page about">
      <header className="page-header">
        <h1>Acerca de ARGOS</h1>
        <p className="lead">
          ARGOS es una plataforma gratuita, de código abierto, educativa y defensiva. Enseña a observar señales, comprender
          amenazas y practicar decisiones con ejercicios cortos donde equivocarse es parte de aprender.
        </p>
      </header>

      <div className="about-grid">
        <section className="card about-card" aria-labelledby="about-name">
          <Eye size={28} aria-hidden="true" />
          <h2 id="about-name">Por qué «Argos»</h2>
          <p>
            Por Argos Panoptes, el gigante de la mitología griega con cien ojos que nunca dormía del todo. ARGOS está hecho para
            vigilar, detectar y comprender, no para atacar.
          </p>
        </section>

        <section className="card about-card" aria-labelledby="about-scope">
          <ShieldCheck size={28} aria-hidden="true" />
          <h2 id="about-scope">Qué es simulado</h2>
          <ul>
            <li>Todos los correos, personas, marcas y dominios son inventados (usan dominios reservados como <code>.example</code>).</li>
            <li>Los enlaces se muestran como texto inerte y los adjuntos no se pueden descargar.</li>
            <li>ARGOS no envía, recibe ni abre correos reales.</li>
          </ul>
        </section>

        <section className="card about-card" aria-labelledby="about-privacy">
          <Lock size={28} aria-hidden="true" />
          <h2 id="about-privacy">Privacidad</h2>
          <p>
            No hay registro, cuentas, cookies de terceros, telemetría ni servicios externos. Tu progreso se guarda solo en el{' '}
            <code>localStorage</code> de este navegador y podés borrarlo cuando quieras desde el simulador.
          </p>
        </section>

        <section className="card about-card" aria-labelledby="about-limits">
          <TriangleAlert size={28} aria-hidden="true" />
          <h2 id="about-limits">Limitaciones</h2>
          <p>
            Los casos son simplificados y no cubren todas las variantes de fraude. Un buen resultado acá no garantiza detectar
            todo en la vida real: la costumbre de verificar por otro canal es lo que más protege.
          </p>
        </section>
      </div>

      <section className="card ethics" aria-labelledby="about-ethics">
        <div className="ethics-head">
          <Scale size={28} aria-hidden="true" />
          <h2 id="about-ethics">Ética y seguridad</h2>
        </div>
        <p>
          <strong>Regla de oro:</strong> todo se simula en un sandbox. Nada de ARGOS se usa contra sistemas, redes, cuentas o
          personas reales.
        </p>
        <div className="ethics-cols">
          <div>
            <h3>Lo que ARGOS hace</h3>
            <ul>
              <li>Explica amenazas con ejemplos inventados y controlados.</li>
              <li>Corre las simulaciones en tu navegador, sin salir a internet.</li>
              <li>Usará datasets públicos respetando sus licencias y citas.</li>
            </ul>
          </div>
          <div>
            <h3>Lo que ARGOS no hace</h3>
            <ul>
              <li>No envía correos de phishing ni contacta a nadie.</li>
              <li>No prueba contraseñas contra servicios reales.</li>
              <li>No incluye exploits, payloads ni malware real.</li>
              <li>No usa redes, datos ni cuentas de terceros.</li>
            </ul>
          </div>
        </div>
        <p className="ethics-legal">
          En Argentina, el acceso no autorizado a sistemas o datos informáticos es un delito (Ley 26.388). Esto no es
          asesoramiento legal: marca el límite del proyecto.
        </p>
      </section>

      <section className="about-foot">
        <p>
          Creado por Agustín Delgado (Buenos Aires). Código bajo licencia MIT; su uso está sujeto a las reglas de ética del
          proyecto.
        </p>
        <div className="about-ctas">
          <Link to="/casos/phishing" className="btn btn-primary">Probar el simulador</Link>
          <Link to="/modulos" className="btn btn-outline">Ver próximos módulos</Link>
        </div>
      </section>
    </div>
  );
}
