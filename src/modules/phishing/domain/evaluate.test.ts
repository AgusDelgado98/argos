import { evaluateDecision, feedbackMessage, outcomeExtraNote } from './evaluate';

describe('feedbackMessage', () => {
  const s = { classification: 'phishing' as const, keySignal: 'Este correo pedía tu clave.' };
  it('si se escapó la señal, la nombra y dice la respuesta más adecuada', () => {
    expect(feedbackMessage(s, 'legitimate')).toMatchObject({
      badge: 'Esta vez se escapó una señal',
      signal: 'Este correo pedía tu clave.',
      bestAnswer: 'Es un posible phishing',
    });
  });
  it('si acierta, no repite la respuesta', () => {
    expect(feedbackMessage(s, 'phishing')).toMatchObject({ bestAnswer: null, lead: 'Leíste bien las señales.' });
  });
});

describe('evaluateDecision', () => {
  it('acierto cuando coincide la clasificación', () => {
    expect(evaluateDecision({ classification: 'phishing' }, 'phishing')).toBe('correct');
    expect(evaluateDecision({ classification: 'legitimate' }, 'legitimate')).toBe('correct');
    expect(evaluateDecision({ classification: 'needs_more_info' }, 'needs_more_info')).toBe('correct');
  });
  it('confiar en algo que no era legítimo es riesgoso', () => {
    expect(evaluateDecision({ classification: 'phishing' }, 'legitimate')).toBe('risky');
    expect(evaluateDecision({ classification: 'needs_more_info' }, 'legitimate')).toBe('risky');
  });
  it('desconfiar o pedir más datos sin acertar es prudente', () => {
    expect(evaluateDecision({ classification: 'legitimate' }, 'phishing')).toBe('cautious');
    expect(evaluateDecision({ classification: 'phishing' }, 'needs_more_info')).toBe('cautious');
    expect(evaluateDecision({ classification: 'needs_more_info' }, 'phishing')).toBe('cautious');
  });
  it('explica por qué no todo lo dudoso es phishing', () => {
    expect(outcomeExtraNote({ classification: 'legitimate' }, 'phishing')).toMatch(/verificar por otro canal/);
    expect(outcomeExtraNote({ classification: 'phishing' }, 'phishing')).toBeNull();
  });
});
