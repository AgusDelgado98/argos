import { screen, within } from '@testing-library/react';
import { renderApp } from '../test/render';

describe('navegación y páginas', () => {
  it('landing: hero, CTA y las cuatro áreas de práctica', () => {
    renderApp('/');
    expect(screen.getByRole('heading', { level: 1, name: /Aprendé a ver las señales antes de que sea tarde/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explorar casos interactivos/ })).toHaveAttribute('href', '/casos/phishing');
    expect(screen.getByRole('link', { name: /Conocer la plataforma/ })).toHaveAttribute('href', '/acerca');
    const areas = screen.getByRole('region', { name: /Explorá las áreas de práctica/ });
    const links = within(areas).getAllByRole('link');
    expect(links).toHaveLength(4);
    expect(links[0]).toHaveAttribute('href', '/casos/phishing');
    expect(within(areas).getAllByText('Próximamente')).toHaveLength(3);
  });

  it('la navegación principal lleva a Conceptos y Acerca de', async () => {
    const { user } = renderApp('/');
    const nav = screen.getByRole('navigation', { name: 'Principal' });
    await user.click(within(nav).getByRole('link', { name: /Conceptos/ }));
    expect(screen.getByRole('heading', { level: 1, name: 'Conceptos' })).toBeInTheDocument();
    for (const term of ['Phishing', 'Remitente', 'Dominio', 'Urgencia y presión', 'Adjunto', 'Enlace', 'Verificación por otro canal']) {
      expect(screen.getByRole('heading', { level: 2, name: term })).toBeInTheDocument();
    }
    await user.click(within(nav).getByRole('link', { name: /Acerca de/ }));
    expect(screen.getByRole('heading', { level: 1, name: 'Acerca de ARGOS' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ética y seguridad' })).toBeInTheDocument();
  });

  it('guía rápida: se abre, se cierra con Escape', async () => {
    const { user } = renderApp('/');
    await user.click(screen.getByRole('button', { name: /Guía rápida/ }));
    expect(screen.getByRole('dialog', { name: 'Guía rápida' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('próximos módulos: teasers honestos con el aviso de simulación', () => {
    renderApp('/modulos');
    expect(screen.getByRole('heading', { level: 1, name: 'Próximos módulos' })).toBeInTheDocument();
    expect(screen.getAllByText(/Simulación ficticia\. No afecta tus archivos, redes ni cuentas\./).length).toBeGreaterThanOrEqual(3);
    expect(screen.getByRole('heading', { name: /Laboratorio Worm/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Centro Blue Team/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /IA y seguridad/ })).toBeInTheDocument();
  });

  it('un módulo planificado no abre una vista falsa: redirige a su ficha', async () => {
    renderApp('/casos/amenazas');
    expect(await screen.findByRole('heading', { level: 1, name: 'Próximos módulos' })).toBeInTheDocument();
  });

  it('ruta inexistente muestra 404', () => {
    renderApp('/no-existe');
    expect(screen.getByRole('heading', { name: /No encontramos esa página/ })).toBeInTheDocument();
  });

  it('el hub de casos lista los módulos del registro', () => {
    renderApp('/casos');
    expect(screen.getByRole('heading', { level: 2, name: /Detectar engaños — Phishing/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Empezar/ })).toHaveAttribute('href', '/casos/phishing');
  });

  it('ninguna página enlaza a sitios externos', async () => {
    for (const path of ['/', '/casos', '/conceptos', '/acerca', '/modulos']) {
      const { container, unmount } = renderApp(path);
      container.querySelectorAll('a[href]').forEach((a) => {
        const href = a.getAttribute('href')!;
        expect(href.startsWith('/') || href.startsWith('#'), `${path}: ${href}`).toBe(true);
      });
      unmount();
    }
  });
});
