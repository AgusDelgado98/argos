import { Link } from 'react-router-dom';
import { CONCEPTS } from '../modules/theory/glossary';

export function ConceptsPage() {
  return (
    <div className="container page">
      <header className="page-header">
        <h1>Conceptos</h1>
        <p className="lead">
          Un glosario corto para leer mejor cada correo. Las explicaciones de los casos enlazan acá cuando hace falta.
        </p>
      </header>
      <nav aria-label="Índice de conceptos" className="concept-index">
        <ul>
          {CONCEPTS.map((c) => (
            <li key={c.id}>
              <a href={`#${c.id}`}>{c.term}</a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="concept-list">
        {CONCEPTS.map((c) => (
          <article key={c.id} id={c.id} className="card concept-card" tabIndex={-1}>
            <h2>{c.term}</h2>
            <p className="concept-short">{c.short}</p>
            <p>{c.detail}</p>
            <h3>Qué observar</h3>
            <ul>
              {c.lookFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <p>
        <Link to="/casos/phishing" className="btn btn-primary">
          Practicar con casos
        </Link>
      </p>
    </div>
  );
}
