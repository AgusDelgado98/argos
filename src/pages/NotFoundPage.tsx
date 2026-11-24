import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="container page">
      <h1>No encontramos esa página</h1>
      <p className="lead">Puede que el enlace esté mal escrito o que el módulo todavía no exista.</p>
      <Link to="/" className="btn btn-primary">Volver al inicio</Link>
    </div>
  );
}
