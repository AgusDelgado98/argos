import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SHOTS = process.env.SCREENSHOT_DIR;
/** Capturas de revisión de una iteración (viewport, no página completa). */
const ITER = process.env.ITER_DIR;
if (ITER) mkdirSync(ITER, { recursive: true });

async function shot(page: Page, name: string, projectName: string) {
  if (!SHOTS) return;
  mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: join(SHOTS, `${name}-${projectName}.png`), fullPage: true });
}

function trackConsole(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

test('landing → simulador → decisión → análisis, sin errores de consola ni pedidos externos', async ({ page }, info) => {
  test.skip(info.project.name === 'mobile', 'En móvil el flujo usa el panel inferior (ver test móvil).');
  const errors = trackConsole(page);
  const external: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith('http://localhost:4173')) external.push(r.url());
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: /Aprendé a ver las señales/ })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await shot(page, 'landing', info.project.name);

  await page.getByRole('link', { name: /Explorar casos interactivos/ }).click();
  await expect(page.getByText('Caso 1 de 12')).toBeVisible();
  await shot(page, 'simulador-inicial', info.project.name);

  await page.getByRole('button', { name: /Mostrar pista/ }).click();
  await page.getByRole('button', { name: /Mostrar pista/ }).click();
  await page.getByRole('button', { name: /Confirmar mis credenciales/ }).click();
  await expect(page.getByText(/Enlace simulado e inactivo/)).toBeVisible();
  await page.getByRole('button', { name: 'Es un posible phishing' }).click();
  await expect(page.getByRole('region', { name: /Análisis del caso/ })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, 'simulador-analisis', info.project.name);


  // El progreso sobrevive a recargar la página.
  await page.reload();
  await expect(page.getByRole('region', { name: /Análisis del caso/ })).toBeVisible();

  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('modo Desafío oculta pistas', async ({ page }, info) => {
  await page.goto('/casos/phishing');
  await page.getByRole('button', { name: /Desafío/ }).click();
  if (info.project.name !== 'mobile') await expect(page.getByText(/se ocultan hasta que respondas/)).toBeVisible();
  else await expect(page.getByRole('button', { name: /Pistas/ })).toHaveCount(0);
  await expect(page.locator('mark')).toHaveCount(0);
  await shot(page, 'simulador-desafio', info.project.name);
});

test('móvil: observar el correo → panel inferior → devolución constructiva', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'Solo móvil');
  const errors = trackConsole(page);
  await page.goto('/casos/phishing');
  await page.evaluate(() => document.fonts.ready);

  // 1. El correo es protagonista: visible arriba, sin decisiones en la página.
  const mail = page.getByRole('article', { name: /Tu cuenta se bloqueará/ });
  await expect(mail).toBeVisible();
  const box = await mail.boundingBox();
  expect(box!.y).toBeLessThan(220);
  await expect(page.getByRole('button', { name: 'Parece legítimo' })).toHaveCount(0);
  const bar = page.getByRole('region', { name: 'Acciones del caso' });
  await expect(bar).toBeVisible();

  // 2. Panel inferior con las tres decisiones.
  await bar.getByRole('button', { name: /Responder/ }).click();
  const sheet = page.getByRole('dialog', { name: /Qué harías/ });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole('button', { name: 'No tengo suficiente información' })).toBeVisible();
  await page.waitForTimeout(300); // animación de entrada

  // 3. Respuesta equivocada → devolución constructiva.
  await sheet.getByRole('button', { name: 'Parece legítimo' }).click();
  const feedback = page.getByRole('dialog', { name: 'Devolución del caso' });
  await expect(feedback.getByText('Esta vez se escapó una señal')).toBeVisible();
  await expect(feedback.getByRole('heading', { name: 'Lo que conviene mirar' })).toBeVisible();
  await expect(feedback.getByText(/La respuesta más adecuada era/)).toBeVisible();
  await expect(feedback.getByRole('button', { name: 'Ver análisis completo' })).toBeVisible();
  await page.waitForTimeout(300);
  await feedback.getByRole('button', { name: 'Ver análisis completo' }).click();
  await expect(feedback.getByText(/No ingresar al enlace/)).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(bar.getByRole('button', { name: /Ver devolución/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test('escritorio: devolución constructiva tras una respuesta equivocada', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Solo escritorio');
  await page.goto('/casos/phishing');
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole('button', { name: /Mostrar pista/ }).click();
  await page.getByRole('button', { name: 'Parece legítimo' }).click();
  const analysis = page.getByRole('region', { name: /Análisis del caso/ });
  await expect(analysis.getByText('Esta vez se escapó una señal')).toBeVisible();
  await expect(analysis.getByRole('heading', { name: 'Lo que conviene mirar' })).toBeVisible();
  await expect(page.locator('.badge-danger')).toHaveCount(0);
  await analysis.evaluate((el) => el.scrollIntoView({ block: 'end' }));
  await page.waitForTimeout(400);
});

/** Resultado mixto realista para el Desafío: 8 bien, 2 prudentes, 2 para repasar (el 12 se responde en vivo). */
const MIXED: Record<string, [string, string]> = {
  'ARG-001': ['phishing', 'correct'],
  'ARG-002': ['legitimate', 'correct'],
  'ARG-003': ['phishing', 'cautious'],
  'ARG-004': ['phishing', 'correct'],
  'ARG-005': ['legitimate', 'correct'],
  'ARG-006': ['legitimate', 'risky'],
  'ARG-007': ['needs_more_info', 'correct'],
  'ARG-008': ['legitimate', 'correct'],
  'ARG-009': ['phishing', 'correct'],
  'ARG-010': ['legitimate', 'risky'],
  'ARG-011': ['phishing', 'correct'],
};

async function seedChallenge(page: Page) {
  const challenge: Record<string, object> = Object.fromEntries(
    Object.entries(MIXED).map(([id, [decision, outcome]]) => [
      id,
      { visited: true, hintsRevealed: 0, decision, outcome, answeredAt: '2026-11-23T12:00:00.000Z' },
    ]),
  );
  challenge['ARG-012'] = { visited: true, hintsRevealed: 0 };
  const state = {
    version: 1,
    updatedAt: '2026-11-23T12:00:00.000Z',
    modules: { phishing: { mode: 'challenge', currentCaseId: 'ARG-012', byMode: { learn: {}, challenge } } },
  };
  await page.addInitScript((s) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('argos.progress', s);
      sessionStorage.setItem('seeded', '1');
    }
  }, JSON.stringify(state));
}

test('resumen final del Desafío con resultado mixto', async ({ page }, info) => {
  test.skip(info.project.name === 'tablet', 'Se revisa en móvil y escritorio.');
  const errors = trackConsole(page);
  const mobile = info.project.name === 'mobile';
  await seedChallenge(page);
  await page.goto('/casos/phishing');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByText('Caso 12 de 12')).toBeVisible();

  // Caso 12 respondido en vivo con una opción prudente.
  if (mobile) {
    await page.getByRole('region', { name: 'Acciones del caso' }).getByRole('button', { name: /Responder/ }).click();
    const sheet = page.getByRole('dialog', { name: /Qué harías/ });
    await sheet.getByRole('button', { name: 'No tengo suficiente información' }).click();
    const feedback = page.getByRole('dialog', { name: 'Devolución del caso' });
    await expect(feedback.getByText('Buena intuición')).toBeVisible();
    const toSummary = feedback.getByRole('button', { name: 'Ver resumen del Desafío' });
    await expect(toSummary).toBeVisible();
    await page.waitForTimeout(350);
    await toSummary.click();
  } else {
    await page.getByRole('button', { name: 'No tengo suficiente información' }).click();
    await page.getByRole('button', { name: 'Ver resumen del Desafío' }).first().click();
  }

  // Nivel 1: resumen inmediato.
  const report = page.getByRole('region', { name: 'Tu recorrido de observación' });
  await expect(report).toBeVisible();
  await expect(report.locator('.report-total')).toHaveText('8 de 12 casos bien resueltos');
  await expect(report.getByRole('list', { name: 'Resultado' })).toContainText('2 para revisar');
  await expect(report.getByRole('note', { name: 'Recomendación' })).toBeVisible();
  await expect(report.getByRole('heading', { name: 'Cómo te fue por tipo de señal' })).toHaveCount(0);
  await expect(report.locator('details, .meter')).toHaveCount(0);
  await expect(report).not.toContainText(/fallaste/i);
  await expect(page.locator('.badge-danger')).toHaveCount(0);
  // Sin navegación entre casos en el resumen.
  await expect(page.getByText(/Caso \d+ de 12/)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Caso anterior' })).toHaveCount(0);
  await expect(page.locator('.segments')).toHaveCount(0);
  if (mobile) await expect(page.getByRole('region', { name: 'Acciones del caso' })).toHaveCount(0);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  // Todo el nivel 1 entra en la pantalla sin desplazarse.
  const vh = page.viewportSize()!.height;
  const box = await report.boundingBox();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(vh);
  await expect(report.getByRole('button', { name: 'Repasar estos casos' })).toBeInViewport();
  await expect(report.getByRole('button', { name: 'Ver mi análisis completo' })).toBeInViewport();

  // Nivel 2: análisis completo, solo a pedido.
  await report.getByRole('button', { name: 'Ver mi análisis completo' }).click();
  const analysis = page.getByRole('region', { name: 'Tu análisis completo' });
  await expect(analysis.getByRole('heading', { level: 2, name: 'Tu análisis completo' })).toBeFocused();
  await expect(analysis.getByRole('heading', { name: 'Cómo te fue por tipo de señal' })).toBeVisible();
  await expect(analysis.locator('.report-strengths > li')).toHaveCount(8);
  await expect(analysis.getByRole('region', { name: /Respuestas para revisar/ }).getByRole('button')).toHaveCount(2);
  await expect(analysis.getByRole('heading', { name: 'Para practicar más' })).toBeVisible();
  await expect(analysis.getByRole('heading', { name: 'Seguí practicando' })).toBeVisible();
  await page.waitForTimeout(300);

  // Volver al resumen.
  await analysis.getByRole('button', { name: /Volver al resumen/ }).click();
  await expect(page.getByRole('button', { name: 'Ver mi análisis completo' })).toBeFocused();
  expect(errors).toEqual([]);
});

async function answerInLearn(page: Page, mobile: boolean, option: string) {
  if (mobile) {
    await page.getByRole('region', { name: 'Acciones del caso' }).getByRole('button', { name: /Responder/ }).click();
    await page.getByRole('dialog', { name: /Qué harías/ }).getByRole('button', { name: option }).click();
    return page.getByRole('dialog', { name: 'Devolución del caso' });
  }
  await page.getByRole('button', { name: option }).click();
  return page.getByRole('region', { name: /Análisis del caso/ }).locator('..');
}

async function openSummaryWithMixed(page: Page) {
  await seedChallenge(page);
  await page.goto('/casos/phishing');
  await page.evaluate(() => document.fonts.ready);
  // El caso 12 queda sin responder en la semilla: se responde con prudencia y se abre el resumen.
  return page;
}

test('repaso guiado de las respuestas riesgosas, sin cambiar el Desafío', async ({ page }, info) => {
  test.skip(info.project.name === 'tablet', 'Se revisa en móvil y escritorio.');
  const errors = trackConsole(page);
  const mobile = info.project.name === 'mobile';
  await openSummaryWithMixed(page);
  const feedback12 = await answerInLearnOrChallenge(page, mobile);
  await feedback12.getByRole('button', { name: 'Ver resumen del Desafío' }).first().click();

  const summary = page.getByRole('region', { name: 'Tu recorrido de observación' });
  await expect(summary.getByText('Repasás los casos 6 y 10 en modo Aprender, uno por vez.')).toBeVisible();
  await summary.getByRole('button', { name: 'Repasar estos casos' }).click();

  // Caso 1 del repaso.
  const bar = page.getByRole('status', { name: 'Repaso en curso' });
  await expect(bar).toContainText('Repaso 1 de 2');
  await expect(page.getByRole('article', { name: 'Necesito una transferencia urgente' })).toBeVisible();
  const fb1 = await answerInLearn(page, mobile, 'Es un posible phishing');
  const nextReview = fb1.getByRole('button', { name: 'Siguiente caso para repasar' }).first();
  await expect(nextReview).toBeVisible();
  await page.waitForTimeout(350);
  if (ITER && mobile) await page.screenshot({ path: join(ITER, 'mobile-repaso-transicion.png') });

  // Salir y recargar: el repaso continúa donde quedó.
  if (mobile) await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Salir del repaso' }).click();
  await expect(bar).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: /Desafío/ }).first().click();
  await expect(page.getByText('Llevás 1 de 2 casos repasados.')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar el repaso' }).click();
  await expect(bar).toContainText('Repaso 2 de 2');
  await expect(page.getByText('Caso 10 de 12')).toBeVisible();

  // Último caso del repaso → confirmación.
  const fb2 = await answerInLearn(page, mobile, 'No tengo suficiente información');
  await fb2.getByRole('button', { name: 'Terminar el repaso' }).first().click();
  const done = page.getByRole('region', { name: 'Repasaste los 2 casos pendientes' });
  await expect(done).toBeVisible();
  await expect(done).toContainText('Repaso completado');
  await expect(done).toContainText('Tu resultado del Desafío no cambia: 8 de 12 casos bien resueltos.');
  await expect(page.getByText(/Caso \d+ de 12/)).toHaveCount(0);
  await page.waitForTimeout(300);
  if (ITER && mobile) await page.screenshot({ path: join(ITER, 'mobile-repaso-completado.png') });

  // Volver al resumen: el puntaje del Desafío sigue igual.
  await done.getByRole('button', { name: 'Volver al resumen del Desafío' }).click();
  await expect(summary.locator('.report-total')).toHaveText('8 de 12 casos bien resueltos');
  await expect(summary.getByRole('list', { name: 'Resultado' })).toContainText('2 para revisar');
  const challenge = await page.evaluate(() => JSON.parse(localStorage.getItem('argos.progress')!).modules.phishing.byMode.challenge);
  expect(challenge['ARG-006']).toMatchObject({ decision: 'legitimate', outcome: 'risky' });
  expect(challenge['ARG-010']).toMatchObject({ decision: 'legitimate', outcome: 'risky' });
  expect(errors).toEqual([]);
});

async function answerInLearnOrChallenge(page: Page, mobile: boolean) {
  // Responde el caso 12 del Desafío (prudente) y devuelve el contenedor con «Ver resumen del Desafío».
  if (mobile) {
    await page.getByRole('region', { name: 'Acciones del caso' }).getByRole('button', { name: /Responder/ }).click();
    await page.getByRole('dialog', { name: /Qué harías/ }).getByRole('button', { name: 'No tengo suficiente información' }).click();
    return page.getByRole('dialog', { name: 'Devolución del caso' });
  }
  await page.getByRole('button', { name: 'No tengo suficiente información' }).click();
  return page.locator('body');
}

async function seedResult(page: Page, risky: string[]) {
  const correct: Record<string, string> = {
    'ARG-001': 'phishing', 'ARG-002': 'legitimate', 'ARG-003': 'needs_more_info', 'ARG-004': 'phishing',
    'ARG-005': 'legitimate', 'ARG-006': 'phishing', 'ARG-007': 'needs_more_info', 'ARG-008': 'legitimate',
    'ARG-009': 'phishing', 'ARG-010': 'needs_more_info', 'ARG-011': 'phishing', 'ARG-012': 'legitimate',
  };
  const challenge = Object.fromEntries(
    Object.entries(correct).map(([id, d]) => [
      id,
      risky.includes(id)
        ? { visited: true, hintsRevealed: 0, decision: d === 'phishing' ? 'legitimate' : 'phishing', outcome: 'risky' }
        : { visited: true, hintsRevealed: 0, decision: d, outcome: 'correct' },
    ]),
  );
  const state = { version: 1, updatedAt: '', modules: { phishing: { mode: 'challenge', currentCaseId: 'ARG-012', byMode: { learn: {}, challenge } } } };
  await page.addInitScript((s) => localStorage.setItem('argos.progress', s), JSON.stringify(state));
}

test('repaso: un solo caso', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Solo escritorio');
  await seedResult(page, ['ARG-006']);
  await page.goto('/casos/phishing');
  const summary = page.getByRole('region', { name: 'Tu recorrido de observación' });
  await expect(summary.getByText('Repasás el caso 6 en modo Aprender.')).toBeVisible();
  await summary.getByRole('button', { name: 'Repasar estos casos' }).click();
  await expect(page.getByRole('status', { name: 'Repaso en curso' })).toContainText('Repaso 1 de 1');
  await page.getByRole('button', { name: 'Es un posible phishing' }).click();
  await expect(page.getByRole('button', { name: 'Siguiente caso para repasar' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Terminar el repaso' }).click();
  await expect(page.getByRole('region', { name: 'Repasaste el caso pendiente' })).toBeVisible();
});

test('repaso: cero casos riesgosos ofrece otra acción', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Solo escritorio');
  await seedResult(page, []);
  await page.goto('/casos/phishing');
  const summary = page.getByRole('region', { name: 'Tu recorrido de observación' });
  await expect(summary).toBeVisible();
  await expect(summary.getByRole('button', { name: 'Repasar estos casos' })).toHaveCount(0);
  await expect(summary.getByRole('button', { name: 'Volver a intentar el Desafío' })).toBeVisible();
});
