import { screen, within } from '@testing-library/react';
import { renderApp } from '../../test/render';
import { STORAGE_KEY, createProgressStore } from '../../lib/progress/store';
import { createMemoryStorage } from '../../lib/storage';

async function openSimulator(storage = createMemoryStorage()) {
  const utils = renderApp('/casos/phishing', storage);
  await screen.findByRole('heading', { level: 1, name: /Detectar engaños\s*—\s*Phishing/ });
  return utils;
}

describe('simulador de phishing (flujo)', () => {
  it('flujo completo: inicio → simulador → pista → decisión → análisis', async () => {
    const { user } = renderApp('/');
    await user.click(screen.getByRole('link', { name: /Explorar casos interactivos/ }));
    expect(await screen.findByRole('heading', { level: 1, name: /Detectar engaños/ })).toBeInTheDocument();
    expect(screen.getByText('Caso 1 de 12')).toBeInTheDocument();

    // No hay análisis antes de responder.
    expect(screen.queryByRole('heading', { name: /Análisis del caso/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Mostrar pista/ }));
    expect(screen.getByText('Pistas reveladas: 1 de 3')).toBeInTheDocument();
    expect(document.querySelectorAll('mark[data-marker="1"]').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Es un posible phishing' }));
    const analysis = screen.getByRole('region', { name: /Análisis del caso/ });
    expect(within(analysis).getByText('¡Buena observación!')).toBeInTheDocument();
    expect(within(analysis).getByText(/No ingresar al enlace/)).toBeInTheDocument();
    expect(within(analysis).getByRole('link', { name: 'Dominio' })).toHaveAttribute('href', '/conceptos#dominio');
    expect(analysis).toHaveFocus();
  });

  it('muestra una bandeja con los 12 correos y permite cambiar de caso', async () => {
    const { user } = await openSimulator();
    const inbox = screen.getByRole('navigation', { name: 'Bandeja de entrada' });
    const items = within(inbox).getAllByRole('button');
    expect(items).toHaveLength(12);
    await user.click(within(inbox).getByRole('button', { name: /Biblioteca Horizonte/ }));
    expect(screen.getByText('Caso 5 de 12')).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'Tu reserva está disponible' })).toBeInTheDocument();
  });

  it('al cambiar de caso conserva el resultado sin filtrar pistas de otro', async () => {
    const { user } = await openSimulator();
    await user.click(screen.getByRole('button', { name: /Mostrar pista/ }));
    await user.click(screen.getByRole('button', { name: /Mostrar pista/ }));
    await user.click(screen.getByRole('button', { name: 'Caso siguiente' }));
    expect(screen.getByText('Caso 2 de 12')).toBeInTheDocument();
    expect(screen.getByText('Pistas reveladas: 0 de 3')).toBeInTheDocument();
    expect(document.querySelectorAll('mark').length).toBe(0);
    await user.click(screen.getByRole('button', { name: 'Parece legítimo' }));
    await user.click(screen.getByRole('button', { name: 'Caso anterior' }));
    expect(screen.getByText('Pistas reveladas: 2 de 3')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Caso siguiente' }));
    expect(screen.getByRole('region', { name: /Análisis del caso/ })).toBeInTheDocument();
  });

  it('respuesta riesgosa explica las señales y en Aprender se puede reintentar', async () => {
    const { user } = await openSimulator();
    await user.click(screen.getByRole('button', { name: 'Parece legítimo' }));
    expect(screen.getByText('Esta vez se escapó una señal')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Intentar de nuevo/ }));
    expect(screen.queryByRole('region', { name: /Análisis del caso/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Parece legítimo' })).toBeEnabled();
  });

  it('Desafío: oculta pistas, revela el análisis al responder y suma puntaje', async () => {
    const { user } = await openSimulator();
    await user.click(screen.getByRole('button', { name: /Desafío/ }));
    expect(screen.getByRole('button', { name: /Desafío/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: /Mostrar pista/ })).not.toBeInTheDocument();
    expect(screen.getByText(/se ocultan hasta que respondas/)).toBeInTheDocument();
    expect(document.querySelectorAll('mark').length).toBe(0);

    await user.click(screen.getByRole('button', { name: 'Es un posible phishing' }));
    expect(screen.getByRole('region', { name: /Análisis del caso/ })).toBeInTheDocument();
    expect(document.querySelector('.sim-stats')?.textContent).toMatch(/Puntaje:\s*1\s*\/\s*1/);
    expect(screen.queryByRole('button', { name: /Intentar de nuevo/ })).not.toBeInTheDocument();

    // Volver a Aprender: el mismo caso está sin responder en ese modo.
    await user.click(screen.getByRole('button', { name: /Aprender/ }));
    expect(screen.queryByRole('region', { name: /Análisis del caso/ })).not.toBeInTheDocument();
  });

  it('completar los 12 casos del Desafío muestra el resumen', async () => {
    const { user } = await openSimulator();
    await user.click(screen.getByRole('button', { name: /Desafío/ }));
    for (let i = 0; i < 12; i++) {
      await user.click(screen.getByRole('button', { name: 'No tengo suficiente información' }));
      if (i < 11) await user.click(screen.getByRole('button', { name: /Siguiente caso/ }));
    }
    // Tras el caso 12 se ofrece el resumen (no hay «Siguiente caso»).
    await user.click(screen.getByRole('button', { name: /Ver resumen del Desafío/ }));
    const summary = screen.getByRole('region', { name: 'Tu recorrido de observación' });
    expect(summary.querySelector('.report-total')?.textContent).toMatch(/3 de 12 casos bien resueltos/);
    expect(summary.textContent).not.toMatch(/fallaste|incorrect|tus errores|cometiste/i);
    // El correo, las decisiones y la navegación entre casos dejan lugar al resumen.
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(screen.queryByText(/Caso \d+ de 12/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Caso anterior' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Caso siguiente' })).not.toBeInTheDocument();
    expect(document.querySelector('.segments')).toBeNull();
  });

  it('persiste el progreso en localStorage y lo restaura al volver', async () => {
    const storage = createMemoryStorage();
    const first = await openSimulator(storage);
    await first.user.click(screen.getByRole('button', { name: /Mostrar pista/ }));
    await first.user.click(screen.getByRole('button', { name: 'Es un posible phishing' }));
    await first.user.click(screen.getByRole('button', { name: /Siguiente caso/ }));
    first.unmount();

    const saved = JSON.parse(storage.getItem(STORAGE_KEY)!);
    expect(saved.modules.phishing.byMode.learn['ARG-001']).toMatchObject({ decision: 'phishing', outcome: 'correct', hintsRevealed: 1 });
    expect(saved.modules.phishing.currentCaseId).toBe('ARG-002');

    renderApp('/casos/phishing', storage, createProgressStore(storage));
    expect(await screen.findByText('Caso 2 de 12')).toBeInTheDocument();
    expect(document.querySelector('.sim-stats')?.textContent).toMatch(/1 de 12 resueltos/);
  });

  it('reiniciar progreso pide confirmación y borra todo', async () => {
    const storage = createMemoryStorage();
    const { user } = await openSimulator(storage);
    await user.click(screen.getByRole('button', { name: 'Es un posible phishing' }));
    await user.click(screen.getByRole('button', { name: /Reiniciar progreso/ }));
    const dialog = screen.getByRole('alertdialog', { name: /Reiniciar progreso/ });
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByRole('region', { name: /Análisis del caso/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Reiniciar progreso/ }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sí, reiniciar' }));
    expect(screen.queryByRole('region', { name: /Análisis del caso/ })).not.toBeInTheDocument();
    expect(screen.getByText('Caso 1 de 12')).toBeInTheDocument();
    const saved = JSON.parse(storage.getItem(STORAGE_KEY)!);
    expect(saved.modules.phishing?.byMode?.learn?.['ARG-001']?.decision).toBeUndefined();
  });

  it('progreso corrupto en el navegador no rompe el simulador', async () => {
    const storage = createMemoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, updatedAt: '', modules: { phishing: { mode: 42 } } }));
    await openSimulator(storage);
    expect(screen.getByText('Caso 1 de 12')).toBeInTheDocument();
  });
});

describe('resumen final del Desafío', () => {
  async function completeChallenge() {
    const utils = await openSimulator();
    await utils.user.click(screen.getByRole('button', { name: /Desafío/ }));
    const plan = ['phishing', 'legitimate', 'phishing', 'phishing', 'legitimate', 'legitimate', 'needs_more_info', 'legitimate', 'phishing', 'legitimate', 'phishing', 'needs_more_info'];
    const label = { phishing: 'Es un posible phishing', legitimate: 'Parece legítimo', needs_more_info: 'No tengo suficiente información' } as const;
    for (let i = 0; i < 12; i++) {
      await utils.user.click(screen.getByRole('button', { name: label[plan[i] as keyof typeof label] }));
      await utils.user.click(screen.getByRole('button', { name: i < 11 ? /Siguiente caso/ : /Ver resumen del Desafío/ }));
    }
    return utils;
  }

  it('nivel 1: solo resultado, desglose, recomendación y dos acciones', async () => {
    await completeChallenge();
    const summary = screen.getByRole('region', { name: 'Tu recorrido de observación' });
    expect(within(summary).getByText('Desafío completado')).toBeInTheDocument();
    expect(summary.querySelector('.report-total')?.textContent).toBe('8 de 12 casos bien resueltos');
    const score = within(summary).getByRole('list', { name: 'Resultado' });
    expect(score.textContent).toMatch(/8 bien resueltos/);
    expect(score.textContent).toMatch(/2 con buena intuición/);
    expect(score.textContent).toMatch(/2 para revisar/);
    // Recomendación personalizada: el tipo de señal menos resuelto.
    expect(within(summary).getByRole('note', { name: 'Recomendación' }).textContent).toMatch(/Remitente y «Responder a»/);
    expect(within(summary).getByRole('button', { name: 'Repasar estos casos' })).toBeInTheDocument();
    expect(within(summary).getByText('Repasás los casos 6 y 10 en modo Aprender, uno por vez.')).toBeInTheDocument();
    expect(within(summary).getByRole('button', { name: 'Ver mi análisis completo' })).toBeInTheDocument();
    expect(within(summary).getAllByRole('button')).toHaveLength(2);
    // Sin categorías, acordeones ni análisis extenso en este nivel.
    expect(within(summary).queryByText('Cómo te fue por tipo de señal')).not.toBeInTheDocument();
    expect(within(summary).queryByText('Dominios que imitan')).not.toBeInTheDocument();
    expect(summary.querySelector('details, .meter')).toBeNull();
    expect(within(summary).queryByRole('heading', { name: /Para repasar|Para practicar más|Seguí practicando/ })).not.toBeInTheDocument();
  });

  it('«Repasar estos casos» abre en Aprender el primer caso para revisar', async () => {
    const { user } = await completeChallenge();
    await user.click(screen.getByRole('button', { name: 'Repasar estos casos' }));
    expect(screen.getByRole('button', { name: /Aprender/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Caso 6 de 12')).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'Necesito una transferencia urgente' })).toBeInTheDocument();
  });

  it('nivel 2: el análisis completo se abre a pedido, con foco, y vuelve al resumen', async () => {
    const { user } = await completeChallenge();
    await user.click(screen.getByRole('button', { name: 'Ver mi análisis completo' }));
    expect(screen.queryByRole('region', { name: 'Tu recorrido de observación' })).not.toBeInTheDocument();
    const analysis = screen.getByRole('region', { name: 'Tu análisis completo' });
    expect(within(analysis).getByRole('heading', { level: 2, name: 'Tu análisis completo' })).toHaveFocus();
    expect(within(analysis).getByRole('heading', { name: 'Cómo te fue por tipo de señal' })).toBeInTheDocument();
    expect(within(analysis).getByText('Estimado a partir de tus respuestas en los casos donde aparece cada señal.')).toBeInTheDocument();
    expect(analysis.querySelectorAll('.report-strengths > li')).toHaveLength(8);
    expect(within(analysis).getByText('3 de 3 casos bien resueltos')).toBeInTheDocument();
    expect(within(analysis).getByRole('heading', { name: 'Seguí practicando' })).toBeInTheDocument();

    await user.click(within(analysis).getByRole('button', { name: /Volver al resumen/ }));
    expect(screen.getByRole('region', { name: 'Tu recorrido de observación' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver mi análisis completo' })).toHaveFocus();
  });

  it('nivel 2: separa respuestas para revisar de casos relacionados', async () => {
    const { user } = await completeChallenge();
    await user.click(screen.getByRole('button', { name: 'Ver mi análisis completo' }));
    const analysis = screen.getByRole('region', { name: 'Tu análisis completo' });
    const toReview = within(analysis).getByRole('region', { name: /Respuestas para revisar/ });
    expect(within(toReview).getAllByRole('button')).toHaveLength(2);
    expect(within(toReview).getByText(/Pedido del director/)).toBeInTheDocument();
    expect(within(toReview).getByText(/Invitación a capacitación/)).toBeInTheDocument();
    const practice = within(analysis).getByRole('region', { name: 'Para practicar más' });
    expect(within(practice).getByText(/No son errores/)).toBeInTheDocument();
    expect(within(practice).queryByText('Para revisar')).not.toBeInTheDocument();
    expect(within(practice).queryByRole('button', { name: /Pedido del director/ })).not.toBeInTheDocument();
    expect(analysis.textContent).not.toMatch(/identificaste|reconociste|reconocés|fallaste/i);
    expect(within(analysis).getByRole('link', { name: /Ver concepto: Remitente/ })).toHaveAttribute('href', '/conceptos#remitente');
    await user.click(within(toReview).getByRole('button', { name: /Pedido del director.*: repasar en modo Aprender/ }));
    expect(screen.getByText('Caso 6 de 12')).toBeInTheDocument();
  });

  it('volver a intentar el Desafío pide confirmación y conserva Aprender', async () => {
    const { user } = await completeChallenge();
    await user.click(screen.getByRole('button', { name: 'Ver mi análisis completo' }));
    await user.click(screen.getByRole('button', { name: /Volver a intentar el Desafío/ }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Empezar de nuevo' }));
    expect(screen.queryByRole('region', { name: /Tu recorrido de observación|Tu análisis completo/ })).not.toBeInTheDocument();
    expect(screen.getByText('Caso 1 de 12')).toBeInTheDocument();
    expect(document.querySelector('.sim-stats')?.textContent).toMatch(/0\s*\/\s*0/);
  });

  it('«Ver la bandeja» vuelve a los casos y el resumen sigue disponible', async () => {
    const { user } = await completeChallenge();
    await user.click(screen.getByRole('button', { name: 'Ver mi análisis completo' }));
    await user.click(screen.getByRole('button', { name: /Ver la bandeja/ }));
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByText('Caso 12 de 12')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: /Ver resumen del Desafío/ })[0]);
    expect(screen.getByRole('region', { name: 'Tu recorrido de observación' })).toBeInTheDocument();
  });
});

describe('repaso guiado de las respuestas riesgosas', () => {
  const CORRECT: Record<string, string> = {
    'ARG-001': 'phishing', 'ARG-002': 'legitimate', 'ARG-003': 'needs_more_info', 'ARG-004': 'phishing',
    'ARG-005': 'legitimate', 'ARG-006': 'phishing', 'ARG-007': 'needs_more_info', 'ARG-008': 'legitimate',
    'ARG-009': 'phishing', 'ARG-010': 'needs_more_info', 'ARG-011': 'phishing', 'ARG-012': 'legitimate',
  };
  /** Desafío completo guardado: `risky` y `cautious` indican qué casos no fueron bien resueltos. */
  function seeded(risky: string[], cautious: string[] = []) {
    const storage = createMemoryStorage();
    const challenge = Object.fromEntries(
      Object.entries(CORRECT).map(([id, d]) => {
        const outcome = risky.includes(id) ? 'risky' : cautious.includes(id) ? 'cautious' : 'correct';
        const decision = outcome === 'correct' ? d : outcome === 'risky' ? (d === 'phishing' ? 'legitimate' : 'phishing') : d === 'needs_more_info' ? 'phishing' : 'needs_more_info';
        return [id, { visited: true, hintsRevealed: 0, decision, outcome, answeredAt: '2026-11-23T12:00:00.000Z' }];
      }),
    );
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        updatedAt: '',
        modules: { phishing: { mode: 'challenge', currentCaseId: 'ARG-012', byMode: { learn: {}, challenge } } },
      }),
    );
    return storage;
  }
  const challengeOf = (storage: ReturnType<typeof createMemoryStorage>) => JSON.parse(storage.getItem(STORAGE_KEY)!).modules.phishing.byMode.challenge;

  it('varios casos: recorre la secuencia y confirma al terminar, sin tocar el Desafío', async () => {
    const storage = seeded(['ARG-006', 'ARG-010'], ['ARG-003']);
    const before = challengeOf(storage);
    const { user } = await openSimulator(storage);
    await user.click(screen.getByRole('button', { name: 'Repasar estos casos' }));

    expect(screen.getByRole('button', { name: /Aprender/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status', { name: 'Repaso en curso' })).toHaveTextContent('Repaso 1 de 2');
    expect(screen.getByRole('article', { name: 'Necesito una transferencia urgente' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Es un posible phishing' }));
    expect(screen.queryByRole('button', { name: /^Siguiente caso$/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Siguiente caso para repasar/ }));

    expect(screen.getByRole('status', { name: 'Repaso en curso' })).toHaveTextContent('Repaso 2 de 2');
    expect(screen.getByText('Caso 10 de 12')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'No tengo suficiente información' }));
    await user.click(screen.getByRole('button', { name: /Terminar el repaso/ }));

    const done = screen.getByRole('region', { name: /Repasaste los 2 casos pendientes/ });
    expect(within(done).getByText('Repaso completado')).toBeInTheDocument();
    expect(within(done).getByText(/Tu resultado del Desafío no cambia: 9 de 12/)).toBeInTheDocument();
    expect(within(done).getByRole('heading', { level: 2 })).toHaveFocus();
    expect(screen.queryByRole('status', { name: 'Repaso en curso' })).not.toBeInTheDocument();
    expect(challengeOf(storage)).toEqual(before);

    await user.click(within(done).getByRole('button', { name: /Volver al resumen del Desafío/ }));
    const summary = screen.getByRole('region', { name: 'Tu recorrido de observación' });
    expect(summary.querySelector('.report-total')?.textContent).toBe('9 de 12 casos bien resueltos');
    expect(within(summary).getByText(/Ya repasaste los casos 6 y 10/)).toBeInTheDocument();
  });

  it('un caso: muestra «Repaso 1 de 1» y termina tras responderlo', async () => {
    const { user } = await openSimulator(seeded(['ARG-006']));
    expect(screen.getByText('Repasás el caso 6 en modo Aprender.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Repasar estos casos' }));
    expect(screen.getByRole('status', { name: 'Repaso en curso' })).toHaveTextContent('Repaso 1 de 1');
    await user.click(screen.getByRole('button', { name: 'Parece legítimo' }));
    expect(screen.queryByRole('button', { name: /Siguiente caso para repasar/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Terminar el repaso/ }));
    expect(screen.getByRole('region', { name: 'Repasaste el caso pendiente' })).toBeInTheDocument();
  });

  it('cero casos riesgosos: no ofrece el repaso y propone una alternativa', async () => {
    await openSimulator(seeded([], ['ARG-003']));
    const summary = screen.getByRole('region', { name: 'Tu recorrido de observación' });
    expect(within(summary).queryByRole('button', { name: 'Repasar estos casos' })).not.toBeInTheDocument();
    expect(within(summary).getByRole('button', { name: 'Practicar casos relacionados' })).toBeInTheDocument();
    expect(within(summary).getByText(/No hubo respuestas riesgosas/)).toBeInTheDocument();
  });

  it('cero casos y todo bien resuelto: propone volver a intentar el Desafío', async () => {
    await openSimulator(seeded([]));
    const summary = screen.getByRole('region', { name: 'Tu recorrido de observación' });
    expect(within(summary).queryByRole('button', { name: 'Repasar estos casos' })).not.toBeInTheDocument();
    expect(within(summary).getByRole('button', { name: 'Volver a intentar el Desafío' })).toBeInTheDocument();
  });

  it('salir del repaso conserva el recorrido y al volver continúa donde quedó (persistido)', async () => {
    const storage = seeded(['ARG-006', 'ARG-010']);
    const first = await openSimulator(storage);
    await first.user.click(screen.getByRole('button', { name: 'Repasar estos casos' }));
    await first.user.click(screen.getByRole('button', { name: 'Es un posible phishing' }));
    await first.user.click(screen.getByRole('button', { name: 'Salir del repaso' }));
    expect(screen.queryByRole('status', { name: 'Repaso en curso' })).not.toBeInTheDocument();
    const saved = JSON.parse(storage.getItem(STORAGE_KEY)!).modules.phishing;
    expect(saved.review).toMatchObject({ caseIds: ['ARG-006', 'ARG-010'], done: ['ARG-006'], active: false });
    first.unmount();

    const second = renderApp('/casos/phishing', storage, createProgressStore(storage));
    await screen.findByRole('heading', { level: 1, name: /Detectar engaños/ });
    await second.user.click(screen.getByRole('button', { name: /Desafío/ }));
    expect(screen.getByText('Llevás 1 de 2 casos repasados.')).toBeInTheDocument();
    await second.user.click(screen.getByRole('button', { name: 'Continuar el repaso' }));
    expect(screen.getByRole('status', { name: 'Repaso en curso' })).toHaveTextContent('Repaso 2 de 2');
    expect(screen.getByText('Caso 10 de 12')).toBeInTheDocument();
  });
});
