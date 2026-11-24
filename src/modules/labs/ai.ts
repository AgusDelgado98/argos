/**
 * Fase 4 — IA y seguridad. Solo contratos. Datos públicos o sintéticos,
 * asistente determinista primero; un LLM solo si se decide luego, respetando
 * costo cero y privacidad.
 */
export interface ConfusionMatrix {
  truePositive: number;
  falsePositive: number;
  trueNegative: number;
  falseNegative: number;
}

export interface DetectionMetrics {
  precision: number;
  recall: number;
  f1: number;
  falsePositiveRate: number;
}

export interface PromptInjectionScenario {
  id: string;
  /** Documento ficticio que contiene la instrucción maliciosa. */
  document: string;
  /** Qué debería detectar o mitigar el alumno. */
  expectedMitigation: string;
}
