import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, GraduationCap, Layers, Play, ShieldCheck, Users } from 'lucide-react';
import { ArgosLogo } from '../components/brand/ArgosLogo';
import { HeroIllustration } from '../components/brand/HeroIllustration';
import { ColumnOrnament } from '../components/brand/ColumnOrnament';
import { LANDING_AREAS, MODULES } from '../modules/registry/registry';

const FEATURES = [
  { icon: ShieldCheck, title: 'Práctica segura', text: 'Sin riesgos reales' },
  { icon: Layers, title: 'Casos de la vida real', text: 'Situaciones cotidianas' },
  { icon: GraduationCap, title: 'Aprendizaje claro', text: 'Explicaciones paso a paso' },
  { icon: Users, title: 'Para todos', text: 'Sin requisitos previos' },
];

const STEPS = [
  { title: 'Observá', text: 'Un correo inventado llega a tu bandeja. Mirá remitente, tono, enlaces y adjuntos.' },
  { title: 'Decidí', text: '¿Parece legítimo, es un posible phishing o te falta información? No hay respuestas obvias.' },
  { title: 'Entendé', text: 'Cada caso termina con las señales marcadas, qué verificar y la acción recomendada.' },
];

export function HomePage() {
  const areas = LANDING_AREAS.map((area) => MODULES.find((m) => m.area === area)).filter((m) => m !== undefined);

  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-title">
        <ColumnOrnament />
        <div className="container hero-inner">
          <div className="hero-copy">
            <ArgosLogo variant="hero" />
            <h1 id="hero-title">Aprendé a ver las señales antes de que sea tarde.</h1>
            <p className="hero-lead">
              Explorá casos interactivos y simulaciones seguras para reconocer fraudes digitales, entender amenazas comunes y
              practicar cómo protegerte en situaciones reales.
            </p>
            <div className="hero-ctas">
              <Link to="/casos/phishing" className="btn btn-primary btn-lg">
                <Play size={18} aria-hidden="true" /> Explorar casos interactivos
              </Link>
              <Link to="/acerca" className="btn btn-outline btn-lg">
                <BookOpen size={18} aria-hidden="true" /> Conocer la plataforma
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <HeroIllustration />
          </div>
        </div>
        <div className="container">
          <ul className="feature-strip" aria-label="Por qué ARGOS">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon size={30} strokeWidth={1.6} aria-hidden="true" />
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container areas" aria-labelledby="areas-title">
        <h2 id="areas-title" className="section-title">
          Explorá las áreas de práctica
        </h2>
        <ul className="area-grid">
          {areas.map((m) => {
            const Icon = m.icon;
            const available = m.status === 'available';
            return (
              <li key={m.id}>
                <Link
                  to={available ? `/casos/${m.slug}` : `/modulos#${m.id}`}
                  className={`area-card${available ? ' is-available' : ''}`}
                >
                  <Icon size={40} strokeWidth={1.5} aria-hidden="true" className="area-icon" />
                  <span className="area-text">
                    <strong>{m.cardTitle}</strong>
                    <span>{m.cardDescription}</span>
                    {available ? (
                      <span className="badge">{m.exerciseCount} casos disponibles</span>
                    ) : (
                      <span className="badge badge-soon">Próximamente</span>
                    )}
                  </span>
                  {available && (
                    <span className="area-arrow" aria-hidden="true">
                      <ArrowRight size={18} />
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="container how" aria-labelledby="how-title">
        <h2 id="how-title" className="section-title">
          Cómo funciona
        </h2>
        <ol className="how-steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card">
              <span className="how-num" aria-hidden="true">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="notice how-notice">
          <ShieldCheck size={20} aria-hidden="true" />
          <span>
            Todo lo que ves en ARGOS es ficticio: personas, marcas y dominios inventados, enlaces que no llevan a ningún lado y
            adjuntos que no se pueden descargar. No hace falta registrarse.
          </span>
        </p>
      </section>
    </div>
  );
}
