import { markersIn, parseMarkup, stripMarkup } from './markup';

describe('parseMarkup', () => {
  it('separa texto plano y fragmentos señalados', () => {
    expect(parseMarkup('Hola [[2|urgente]] y [[3|clave]].')).toEqual([
      { text: 'Hola ' },
      { text: 'urgente', marker: 2 },
      { text: ' y ' },
      { text: 'clave', marker: 3 },
      { text: '.' },
    ]);
  });
  it('texto sin marcas queda intacto', () => {
    expect(parseMarkup('Sin marcas')).toEqual([{ text: 'Sin marcas' }]);
  });
  it('stripMarkup y markersIn', () => {
    expect(stripMarkup('[[1|A]] b [[2|C]]')).toBe('A b C');
    expect(markersIn('[[1|A]] b [[2|C]]')).toEqual([1, 2]);
  });
  it('no interpreta HTML: lo deja como texto', () => {
    expect(parseMarkup('<b>[[1|x]]</b>')[0]).toEqual({ text: '<b>' });
  });
});
