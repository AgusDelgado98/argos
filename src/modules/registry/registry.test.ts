import { MODULES, availableModules, plannedModules } from './registry';

describe('registro de módulos', () => {
  it('slugs e ids únicos', () => {
    expect(new Set(MODULES.map((m) => m.id)).size).toBe(MODULES.length);
    expect(new Set(MODULES.map((m) => m.slug)).size).toBe(MODULES.length);
  });
  it('solo phishing está disponible en Fase 1 y tiene componente', () => {
    expect(availableModules.map((m) => m.id)).toEqual(['phishing']);
    expect(availableModules[0].component).toBeDefined();
  });
  it('los módulos planificados no tienen vista y declaran su compromiso de seguridad', () => {
    for (const m of plannedModules) {
      expect(m.component).toBeUndefined();
      expect(m.safety.length).toBeGreaterThan(10);
      expect(m.phase).toBeGreaterThanOrEqual(2);
    }
    expect(plannedModules.map((m) => m.id)).toEqual(expect.arrayContaining(['amenazas', 'incidentes', 'ia']));
  });
});
