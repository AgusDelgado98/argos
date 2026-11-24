import seed from '../../../data/seed/casos-phishing.seed.json';
import raw from '../../../data/phishing-scenarios.json';
import { loadScenarioFile, scenarios } from './scenarios';
import { RESERVED_DOMAIN, domainOf } from '../domain/schema';
import { markersIn } from '../domain/markup';

describe('escenarios de phishing', () => {
  it('hay exactamente 12 casos con ids únicos', () => {
    expect(scenarios).toHaveLength(12);
    expect(new Set(scenarios.map((s) => s.id)).size).toBe(12);
  });

  it('mezcla legítimos, phishing y casos que requieren más información', () => {
    const counts = scenarios.reduce<Record<string, number>>((acc, s) => {
      acc[s.classification] = (acc[s.classification] ?? 0) + 1;
      return acc;
    }, {});
    expect(counts.phishing).toBeGreaterThanOrEqual(3);
    expect(counts.legitimate).toBeGreaterThanOrEqual(3);
    expect(counts.needs_more_info).toBeGreaterThanOrEqual(2);
  });

  it('respeta la semilla del paquete: ids, clasificación, pistas y acción recomendada', () => {
    for (const s of seed) {
      const enriched = scenarios.find((e) => e.id === s.id);
      expect(enriched, s.id).toBeDefined();
      expect(enriched!.classification).toBe(s.classification);
      expect(enriched!.senderEmail).toBe(s.senderEmail);
      expect(enriched!.subject).toBe(s.subject);
      expect(enriched!.hints.map((h) => h.text)).toEqual(s.hints.map((h) => h.text));
      expect(enriched!.feedback.recommendedAction).toBe(s.feedback.recommendedAction);
      expect(enriched!.fictitious).toBe(true);
    }
  });

  it('todas las direcciones y enlaces usan dominios reservados (ficticios)', () => {
    for (const s of scenarios) {
      const addresses = [s.senderEmail, s.to, s.replyTo].filter(Boolean) as string[];
      for (const a of addresses) expect(RESERVED_DOMAIN.test(domainOf(a)), a).toBe(true);
      for (const block of s.content) {
        if (typeof block !== 'string' && block.type === 'link') {
          expect(RESERVED_DOMAIN.test(domainOf(block.url)), block.url).toBe(true);
        }
      }
    }
  });

  it('cada caso tiene hasta 3 pistas y las marcas apuntan a pistas existentes', () => {
    for (const s of scenarios) {
      expect(s.hints.length).toBeGreaterThan(0);
      expect(s.hints.length).toBeLessThanOrEqual(3);
      const marks = s.content.flatMap((b) => (typeof b === 'string' ? markersIn(b) : 'marker' in b && b.marker ? [b.marker] : []));
      for (const m of marks) expect(m).toBeLessThanOrEqual(s.hints.length);
    }
  });

  it('el texto no revela la clasificación con palabras como «phishing» en el correo', () => {
    for (const s of scenarios) {
      const text = s.content.map((b) => (typeof b === 'string' ? b : JSON.stringify(b))).join(' ').toLowerCase();
      expect(text).not.toMatch(/phishing|fraude|legítimo/);
    }
  });

  it('rechaza dominios reales y ids duplicados', () => {
    const bad = structuredClone(raw) as typeof raw;
    bad.scenarios[0].senderEmail = 'alertas@banco-real.com';
    expect(() => loadScenarioFile(bad)).toThrow();

    const dup = structuredClone(raw) as typeof raw;
    dup.scenarios[1].id = dup.scenarios[0].id;
    expect(() => loadScenarioFile(dup)).toThrow(/duplicado/);

    const badLink = structuredClone(raw) as typeof raw;
    (badLink.scenarios[0].content[3] as { url: string }).url = 'https://www.google.com';
    expect(() => loadScenarioFile(badLink)).toThrow();
  });

  it('cada caso define su señal clave y dos pistas principales', () => {
    for (const s of scenarios) {
      expect(s.keySignal.length, s.id).toBeGreaterThan(20);
      expect(new Set(s.keyHints).size, s.id).toBe(2);
      for (const n of s.keyHints) expect(n).toBeLessThanOrEqual(s.hints.length);
    }
    const bad = structuredClone(raw) as typeof raw;
    bad.scenarios[0].keyHints = [1, 1];
    expect(() => loadScenarioFile(bad)).toThrow(/keyHints/);
  });

  it('rechaza marcas sin pista asociada', () => {
    const bad = structuredClone(raw) as typeof raw;
    bad.scenarios[0].hints = bad.scenarios[0].hints.slice(0, 1);
    expect(() => loadScenarioFile(bad)).toThrow(/marca/);
  });
});
