import { ShieldCheck } from 'lucide-react';
import { plannedModules } from '../modules/registry/registry';

export function UpcomingModulesPage() {
  return (
    <div className="container page">
      <header className="page-header">
        <h1>Próximos módulos</h1>
        <p className="lead">
          Así va a crecer ARGOS. Ninguno de estos módulos está disponible todavía: los mostramos para que sepas qué viene y con
          qué límites de seguridad se va a construir.
        </p>
      </header>
      <ul className="upcoming-list">
        {plannedModules.map((m) => {
          const Icon = m.icon;
          return (
            <li key={m.id} id={m.id} className="card upcoming-card" tabIndex={-1}>
              <div className="upcoming-head">
                <Icon size={34} strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <h2>{m.title}</h2>
                  <span className="badge badge-soon">Planificado · Fase {m.phase}</span>
                </div>
              </div>
              <p>{m.description}</p>
              <h3>Qué vas a practicar</h3>
              <ul className="upcoming-topics">
                {m.topics.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <p className="notice">
                <ShieldCheck size={18} aria-hidden="true" />
                <span>{m.safety}</span>
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
