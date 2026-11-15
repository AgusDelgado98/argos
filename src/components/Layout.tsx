import { Outlet } from "react-router"
import { AppLink, AppNavLink } from "./AppLink.tsx"
import { EyeMark } from "./EyeMark.tsx"

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? "nav-link is-active" : "nav-link"
}

export function Layout() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="site-header">
        <div className="wrap header-inner">
          <AppLink to="/" className="brand-lockup">
            <EyeMark className="brand-eye" />
            <span>Argos</span>
          </AppLink>
          <nav className="site-nav" aria-label="Secciones">
            <AppNavLink to="/" className={navClass} end>
              Inicio
            </AppNavLink>
            <AppNavLink to="/phishing" className={navClass}>
              Phishing
            </AppNavLink>
            <AppNavLink to="/reglas" className={navClass}>
              Reglas
            </AppNavLink>
          </nav>
        </div>
      </header>
      <main id="contenido" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="wrap footer-inner">
          <p>Nada de lo que ves se envía a internet. El avance queda en este dispositivo.</p>
          <p>
            <AppLink to="/reglas">Reglas de ética</AppLink>
          </p>
        </div>
      </footer>
    </div>
  )
}
