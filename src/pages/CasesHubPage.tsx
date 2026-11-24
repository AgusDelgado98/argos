import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MODULES } from '../modules/registry/registry';
import { usePhishingProgress } from '../modules/phishing/usePhishingProgress';
import { computeStats } from '../modules/phishing/domain/progress';
import { scenarios } from '../modules/phishing/data/scenarios';

export function CasesHubPage() {
  const { progress } = usePhishingProgress();
  const ids = scenarios.map((s) => s.id);
  const learn = computeStats(progress, ids, 'learn');
  const challenge = computeStats(progress, ids, 'challenge');

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Casos interactivos</h1>
        <p className="lead">Elegí un área de práctica. Cada módulo es una simulación segura con contenido inventado.</p>
      </header>
      <ul className="hub-grid">
        {MODULES.map((m) => {
          const Icon = m.icon;
          const available = m.status === 'available';
          return (
            <li key={m.id} className={`card hub-card${available ? ' is-available' : ''}`}>
              <div className="hub-card-head">
                <Icon size={34} strokeWidth={1.5} aria-hidden="true" />
                {available ? <span className="badge">Disponible</span> : <span className="badge badge-soon">Fase {m.phase} · Próximamente</span>}
              </div>
              <h2>{m.title}</h2>
              <p>{m.description}</p>
              {available && m.id === 'phishing' && (
                <dl className="hub-stats">
                  <div>
                    <dt>Aprender</dt>
                    <dd>{learn.answered} de {learn.total} resueltos</dd>
                  </div>
                  <div>
                    <dt>Desafío</dt>
                    <dd>
                      {challenge.correct} correctas · {challenge.answered} de {challenge.total} respondidos
                    </dd>
                  </div>
                </dl>
              )}
              {available ? (
                <Link to={`/casos/${m.slug}`} className="btn btn-primary">
                  {learn.answered + challenge.answered > 0 ? 'Continuar' : 'Empezar'} <ArrowRight size={18} aria-hidden="true" />
                </Link>
              ) : (
                <Link to={`/modulos#${m.id}`} className="btn btn-ghost">
                  Ver qué incluirá
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
