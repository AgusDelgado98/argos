import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, Compass, Home, Info, Lightbulb, Menu, X } from 'lucide-react';
import { ArgosLogo } from '../components/brand/ArgosLogo';
import { QuickGuide } from './QuickGuide';

const NAV = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/casos', label: 'Casos interactivos', icon: Compass, end: false },
  { to: '/conceptos', label: 'Conceptos', icon: Lightbulb, end: false },
  { to: '/acerca', label: 'Acerca de', icon: Info, end: false },
];

export function Layout() {
  const [guideOpen, setGuideOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      target?.scrollIntoView?.();
      target?.focus?.({ preventScroll: true });
    } else {
      window.scrollTo?.(0, 0);
    }
  }, [location.pathname, location.hash]);

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand-link" aria-label="ARGOS, ir al inicio">
            <ArgosLogo tagline="Concientización y práctica en ciberseguridad" />
          </Link>
          <button
            type="button"
            className="btn btn-icon menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="nav-principal"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
          <nav id="nav-principal" aria-label="Principal" className={`main-nav${menuOpen ? ' is-open' : ''}`}>
            <ul>
              {NAV.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink to={to} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}>
                    <Icon size={18} aria-hidden="true" className="nav-icon" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn-outline btn-sm guide-btn" onClick={() => {
                setMenuOpen(false);
                setGuideOpen(true);
              }}>
              <BookOpen size={18} aria-hidden="true" /> Guía rápida
            </button>
          </nav>
        </div>
      </header>
      <main id="contenido" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <ArgosLogo />
            <p className="footer-claim">Aprendé a ver las señales antes de que sea tarde.</p>
          </div>
          <nav aria-label="Pie de página">
            <ul>
              <li><Link to="/casos/phishing">Simulador de phishing</Link></li>
              <li><Link to="/conceptos">Conceptos</Link></li>
              <li><Link to="/modulos">Próximos módulos</Link></li>
              <li><Link to="/acerca">Acerca de y ética</Link></li>
            </ul>
          </nav>
          <p className="footer-note">
            Proyecto educativo y defensivo, gratuito y de código abierto (MIT). Todo el contenido es ficticio: ARGOS no envía
            correos, no abre enlaces y no recopila datos. Tu progreso queda solo en este navegador.
          </p>
        </div>
      </footer>
      <QuickGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  );
}
