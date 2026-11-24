import { screen, within } from '@testing-library/react';
import { renderApp } from '../../test/render';
import { OUTCOME_COPY } from './domain/evaluate';

function mockMobile(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

async function openMobile() {
  mockMobile(true);
  const utils = renderApp('/casos/phishing');
  await screen.findByRole('heading', { level: 1, name: /Detectar engaños/ });
  return utils;
}

afterEach(() => {
  // @ts-expect-error se restaura el estado de jsdom (sin matchMedia)
  delete window.matchMedia;
});

describe('simulador en móvil (panel inferior)', () => {
  it('primero muestra solo el correo: decisiones, pistas y análisis quedan fuera de la vista', async () => {
    await openMobile();
    expect(screen.getByRole('article', { name: /Tu cuenta se bloqueará/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Parece legítimo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('complementary', { name: /Pistas del caso/ })).not.toBeInTheDocument();
    const bar = screen.getByRole('region', { name: 'Acciones del caso' });
    expect(within(bar).getByRole('button', { name: /Responder/ })).toBeInTheDocument();
    expect(within(bar).getByRole('button', { name: /Pistas 0\/3/ })).toBeInTheDocument();
  });

  it('«Responder» abre un diálogo modal con las tres decisiones; Escape lo cierra', async () => {
    const { user } = await openMobile();
    await user.click(screen.getByRole('button', { name: /Responder/ }));
    const sheet = screen.getByRole('dialog', { name: /Qué harías con este mensaje/ });
    expect(sheet).toHaveAttribute('aria-modal', 'true');
    expect(sheet.contains(document.activeElement)).toBe(true);
    for (const label of ['Parece legítimo', 'Es un posible phishing', 'No tengo suficiente información']) {
      expect(within(sheet).getByRole('button', { name: label })).toBeInTheDocument();
    }
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('el foco queda atrapado dentro del panel', async () => {
    const { user } = await openMobile();
    await user.click(screen.getByRole('button', { name: /Responder/ }));
    const sheet = screen.getByRole('dialog');
    for (let i = 0; i < 8; i++) {
      await user.tab();
      expect(sheet.contains(document.activeElement)).toBe(true);
    }
  });

  it('las pistas se piden desde el panel y resaltan el correo', async () => {
    const { user } = await openMobile();
    await user.click(screen.getByRole('button', { name: /Pistas 0\/3/ }));
    const sheet = screen.getByRole('dialog', { name: 'Pistas del caso' });
    await user.click(within(sheet).getByRole('button', { name: /Mostrar pista/ }));
    expect(within(sheet).getByText(/Pistas reveladas: 1 de 3/)).toBeInTheDocument();
    expect(within(sheet).getByText(/El dominio no coincide/)).toBeInTheDocument();
    expect(document.querySelectorAll('mark[data-marker="1"]').length).toBeGreaterThan(0);
    await user.click(within(sheet).getByRole('button', { name: 'Elegir respuesta' }));
    expect(screen.getByRole('dialog', { name: /Qué harías/ })).toBeInTheDocument();
  });

  it('respuesta equivocada: devolución constructiva, compacta y con detalles desplegables', async () => {
    const { user } = await openMobile();
    await user.click(screen.getByRole('button', { name: /Responder/ }));
    await user.click(screen.getByRole('button', { name: 'Parece legítimo' }));
    const sheet = screen.getByRole('dialog', { name: 'Devolución del caso' });
    expect(within(sheet).getByText('Esta vez se escapó una señal')).toBeInTheDocument();
    expect(within(sheet).getByRole('heading', { name: 'Lo que conviene mirar' })).toBeInTheDocument();
    expect(within(sheet).queryByText(/incorrect|error|a revisar/i)).not.toBeInTheDocument();
    expect(sheet.querySelector('.badge-danger')).toBeNull();
    // Mensaje específico: señal clave + respuesta más adecuada, sin «buena observación igual».
    expect(within(sheet).getByText(/pedía tus credenciales desde un dominio que no es del banco/)).toBeInTheDocument();
    expect(within(sheet).getByText(/La respuesta más adecuada era/)).toBeInTheDocument();
    expect(within(sheet).getByText('«Es un posible phishing»')).toBeInTheDocument();
    expect(sheet.textContent).not.toMatch(/Buena observación igual/);

    // Compacto: solo las dos señales clave (1 y 3); el resto se amplía sin perder contenido.
    const toggle = within(sheet).getByRole('button', { name: 'Ver análisis completo' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(within(sheet).getByText(/El dominio no coincide/)).toBeVisible();
    expect(within(sheet).getByText(/Solicita ingresar credenciales/)).toBeVisible();
    expect(within(sheet).getByText(/Se exige actuar bajo presión/)).not.toBeVisible();
    expect(within(sheet).getByText(/No ingresar al enlace/)).not.toBeVisible();
    await user.click(toggle);
    expect(within(sheet).getByRole('button', { name: 'Ver menos' })).toHaveAttribute('aria-expanded', 'true');
    for (const text of [/Se exige actuar bajo presión/, /No ingresar al enlace/, /Que el dominio sea exactamente/, /Por qué: Es un intento de phishing/]) {
      expect(within(sheet).getByText(text)).toBeVisible();
    }
    expect(within(sheet).getByRole('link', { name: 'Dominio' })).toBeVisible();

    await user.click(within(sheet).getByRole('button', { name: /Intentar de nuevo/ }));
    expect(screen.getByRole('dialog', { name: /Qué harías/ })).toBeInTheDocument();
  });

  it('después de responder, la barra ofrece ver la devolución y avanzar', async () => {
    const { user } = await openMobile();
    await user.click(screen.getByRole('button', { name: /Responder/ }));
    await user.click(screen.getByRole('button', { name: 'Es un posible phishing' }));
    await user.keyboard('{Escape}');
    const bar = screen.getByRole('region', { name: 'Acciones del caso' });
    await user.click(within(bar).getByRole('button', { name: /Ver devolución/ }));
    expect(within(screen.getByRole('dialog')).getByText('¡Buena observación!')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await user.click(within(bar).getByRole('button', { name: /Siguiente caso/ }));
    expect(screen.getByText('Caso 2 de 12')).toBeInTheDocument();
  });

  it('en Desafío no hay botón de pistas en la barra', async () => {
    const { user } = await openMobile();
    await user.click(screen.getByRole('button', { name: /Desafío/ }));
    const bar = screen.getByRole('region', { name: 'Acciones del caso' });
    expect(within(bar).queryByRole('button', { name: /Pistas/ })).not.toBeInTheDocument();
  });
});

describe('tono de las devoluciones', () => {
  it('ningún mensaje castiga al usuario', () => {
    const all = Object.values(OUTCOME_COPY)
      .map((c) => `${c.badge} ${c.message}`)
      .join(' ');
    expect(all).not.toMatch(/incorrect|error|mal |fallaste|a revisar|exponerte/i);
  });
});
