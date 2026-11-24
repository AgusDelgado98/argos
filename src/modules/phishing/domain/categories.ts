/**
 * Tipos de señal que entrena el módulo. Cada pista de cada caso declara su
 * categoría; el resumen del Desafío agrupa los resultados por categoría.
 */
export const SIGNAL_CATEGORIES = [
  'dominio',
  'remitente',
  'urgencia',
  'credenciales',
  'dinero',
  'enlaces',
  'adjuntos',
  'verificacion',
] as const;
export type SignalCategory = (typeof SIGNAL_CATEGORIES)[number];

export interface CategoryInfo {
  label: string;
  /** Consejo breve para repasarla. */
  tip: string;
  /** Ficha del glosario relacionada. */
  conceptId: string;
}

export const CATEGORY_INFO: Record<SignalCategory, CategoryInfo> = {
  dominio: {
    label: 'Dominios que imitan',
    tip: 'Leé el dominio completo después de la @, de derecha a izquierda.',
    conceptId: 'dominio',
  },
  remitente: {
    label: 'Remitente y «Responder a»',
    tip: 'Compará el nombre visible con la dirección y revisá el campo «Responder a».',
    conceptId: 'remitente',
  },
  urgencia: {
    label: 'Urgencia y presión',
    tip: 'La urgencia sola no prueba nada: preocupa cuando viene con un pedido sensible.',
    conceptId: 'urgencia',
  },
  credenciales: {
    label: 'Pedidos de claves y datos',
    tip: 'Preguntate qué te pide el correo: claves, códigos o tarjeta son la señal más fuerte.',
    conceptId: 'phishing',
  },
  dinero: {
    label: 'Pagos y transferencias',
    tip: 'Un pago pedido por correo, con apuro o secreto, se confirma siempre por otro canal.',
    conceptId: 'suplantacion',
  },
  enlaces: {
    label: 'Enlaces',
    tip: 'Ante la duda, no uses el enlace: entrá escribiendo vos la dirección oficial.',
    conceptId: 'enlace',
  },
  adjuntos: {
    label: 'Adjuntos inesperados',
    tip: 'Un adjunto sin contexto (sin pedido, sin contacto) merece una consulta previa.',
    conceptId: 'adjunto',
  },
  verificacion: {
    label: 'Contexto y verificación',
    tip: 'Si no podés confirmar el contexto, «No tengo suficiente información» es una gran respuesta.',
    conceptId: 'verificacion',
  },
};
