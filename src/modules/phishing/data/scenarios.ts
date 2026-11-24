import raw from '../../../data/phishing-scenarios.json';
import { scenarioFileSchema, type Scenario, type ScenarioFile } from '../domain/schema';
import { markersIn } from '../domain/markup';

/** Valida el archivo y la coherencia interna (marcas ↔ pistas, ids únicos). */
export function loadScenarioFile(input: unknown): ScenarioFile {
  const file = scenarioFileSchema.parse(input);
  const ids = new Set<string>();
  for (const scenario of file.scenarios) {
    if (ids.has(scenario.id)) throw new Error(`Id de escenario duplicado: ${scenario.id}`);
    ids.add(scenario.id);
    const max = scenario.hints.length;
    const used = [
      ...Object.values(scenario.markers).filter((m): m is number => typeof m === 'number'),
      ...scenario.content.flatMap((block) =>
        typeof block === 'string' ? markersIn(block) : 'marker' in block && block.marker ? [block.marker] : [],
      ),
    ];
    for (const marker of used) {
      if (marker > max) throw new Error(`${scenario.id}: la marca ${marker} no tiene pista asociada.`);
    }
    if (new Set(scenario.keyHints).size !== 2 || scenario.keyHints.some((n) => n > max)) {
      throw new Error(`${scenario.id}: keyHints debe tener dos pistas distintas y existentes.`);
    }
  }
  return file;
}

export const scenarioFile: ScenarioFile = loadScenarioFile(raw);
export const scenarios: readonly Scenario[] = scenarioFile.scenarios;
export const recipient = scenarioFile.recipient;

export function getScenario(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}
