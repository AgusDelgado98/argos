/**
 * Parser puro del micro-formato de señales: «texto [[2|fragmento]] texto».
 * Devuelve segmentos de texto plano; nunca HTML.
 */
export interface Segment {
  text: string;
  marker?: number;
}

const MARK = /\[\[(\d)\|([^\]]+)\]\]/g;

export function parseMarkup(source: string): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  for (const match of source.matchAll(MARK)) {
    const index = match.index ?? 0;
    if (index > last) segments.push({ text: source.slice(last, index) });
    segments.push({ text: match[2], marker: Number(match[1]) });
    last = index + match[0].length;
  }
  if (last < source.length) segments.push({ text: source.slice(last) });
  return segments;
}

/** Texto visible sin marcas (útil para búsqueda y accesibilidad). */
export function stripMarkup(source: string): string {
  return parseMarkup(source)
    .map((s) => s.text)
    .join('');
}

/** Todos los números de marca usados en un texto. */
export function markersIn(source: string): number[] {
  return parseMarkup(source)
    .filter((s) => s.marker !== undefined)
    .map((s) => s.marker as number);
}
