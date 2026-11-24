import { z } from 'zod';
import { SIGNAL_CATEGORIES } from './categories';

/**
 * Contrato tipado de los escenarios de phishing.
 * Se valida en tiempo de carga: si alguien edita el JSON y rompe el contrato,
 * la app lo detecta (y los tests fallan) en lugar de mostrar datos corruptos.
 */

export const CLASSIFICATIONS = ['legitimate', 'phishing', 'needs_more_info'] as const;
export const classificationSchema = z.enum(CLASSIFICATIONS);
export type Classification = z.infer<typeof classificationSchema>;

/** Solo dominios reservados: .example, .test, .invalid, .localhost o example.com/net/org. */
export const RESERVED_DOMAIN = /(^|\.)(example|test|invalid|localhost)$|(^|\.)example\.(com|net|org)$/i;

export function domainOf(value: string): string {
  const withoutProtocol = value.replace(/^[a-z]+:\/\//i, '');
  const host = withoutProtocol.includes('@') ? withoutProtocol.split('@')[1] : withoutProtocol;
  return host.split(/[/?#:]/)[0].toLowerCase();
}

const fictitiousEmail = z
  .string()
  .email()
  .refine((v) => RESERVED_DOMAIN.test(domainOf(v)), {
    message: 'Las direcciones deben usar dominios reservados (p. ej. .example).',
  });

const markerSchema = z.number().int().min(1).max(3);

export const linkBlockSchema = z.object({
  type: z.literal('link'),
  label: z.string().min(1),
  /** Se muestra como TEXTO inerte. Nunca se convierte en un enlace navegable. */
  url: z.string().refine((v) => RESERVED_DOMAIN.test(domainOf(v)), {
    message: 'Los enlaces simulados deben apuntar a dominios reservados.',
  }),
  marker: markerSchema.optional(),
});

export const attachmentBlockSchema = z.object({
  type: z.literal('attachment'),
  fileName: z.string().min(1),
  size: z.string().min(1),
  marker: markerSchema.optional(),
});

export const signatureBlockSchema = z.object({
  type: z.literal('signature'),
  lines: z.array(z.string().min(1)).min(1),
});

/** Un párrafo es texto plano con marcas opcionales: «texto [[2|fragmento señalado]] texto». */
export const contentBlockSchema = z.union([
  z.string().min(1),
  linkBlockSchema,
  attachmentBlockSchema,
  signatureBlockSchema,
]);

export const hintSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  text: z.string().min(1),
  /** Tipo de señal que entrena esta pista (para el resumen del Desafío). */
  category: z.enum(SIGNAL_CATEGORIES),
});

export const BRAND_ICONS = ['bank', 'health', 'building', 'gift', 'book', 'store', 'truck', 'landmark', 'graduation'] as const;

export const scenarioSchema = z.object({
  id: z.string().regex(/^ARG-\d{3}$/),
  title: z.string().min(1),
  senderName: z.string().min(1),
  senderEmail: fictitiousEmail,
  replyTo: fictitiousEmail.optional(),
  to: fictitiousEmail,
  subject: z.string().min(1),
  preview: z.string().min(1),
  /** Texto original de la semilla; se conserva como referencia para QA. */
  body: z.string().min(1),
  receivedAt: z.string().min(1),
  brand: z.object({ name: z.string().min(1), icon: z.enum(BRAND_ICONS) }).optional(),
  markers: z
    .object({ sender: markerSchema.optional(), replyTo: markerSchema.optional(), subject: markerSchema.optional() })
    .default({}),
  content: z.array(contentBlockSchema).min(1),
  classification: classificationSchema,
  difficulty: z.enum(['inicial', 'intermedio', 'avanzado']),
  hints: z.array(hintSchema).min(1).max(3),
  feedback: z.object({
    summary: z.string().min(1),
    explanation: z.string().min(1),
    recommendedAction: z.string().min(1),
    verify: z.string().min(1),
  }),
  /** La señal más importante del caso, en una frase («Este correo pedía…»). */
  keySignal: z.string().min(1),
  /** Las dos pistas más importantes (números 1–3), que la devolución muestra primero. */
  keyHints: z.array(z.number().int().min(1).max(3)).length(2),
  concepts: z.array(z.string()).default([]),
  fictitious: z.literal(true),
});

export const scenarioFileSchema = z.object({
  schemaVersion: z.literal(1),
  moduleId: z.string(),
  recipient: z.object({ name: z.string(), personalEmail: fictitiousEmail, workEmail: fictitiousEmail }),
  scenarios: z.array(scenarioSchema).min(1),
});

export type Hint = z.infer<typeof hintSchema>;
export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type LinkBlock = z.infer<typeof linkBlockSchema>;
export type AttachmentBlock = z.infer<typeof attachmentBlockSchema>;
export type Scenario = z.infer<typeof scenarioSchema>;
export type ScenarioFile = z.infer<typeof scenarioFileSchema>;
