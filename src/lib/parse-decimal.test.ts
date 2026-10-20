import { describe, expect, it } from 'vitest';

import { parseDecimalBR } from './parse-decimal';

describe('parseDecimalBR', () => {
  it('lê o formato brasileiro: ponto de milhar e vírgula decimal', () => {
    expect(parseDecimalBR('500.000,00')).toBe(500_000);
    expect(parseDecimalBR('1.234.567,89')).toBe(1_234_567.89);
    expect(parseDecimalBR('9,75')).toBe(9.75);
  });

  it('lê números sem separador', () => {
    expect(parseDecimalBR('500000')).toBe(500_000);
    expect(parseDecimalBR('0')).toBe(0);
  });

  it('ignora "R$", "%" e espaços', () => {
    expect(parseDecimalBR('R$ 500.000,00')).toBe(500_000);
    expect(parseDecimalBR(' 9,75 % ')).toBe(9.75);
  });

  it('sem vírgula, ponto seguido de 3 dígitos é milhar', () => {
    expect(parseDecimalBR('500.000')).toBe(500_000);
    expect(parseDecimalBR('1.000.000')).toBe(1_000_000);
  });

  it('sem vírgula, um único ponto seguido de 1 ou 2 dígitos é decimal', () => {
    // Quem digita uma taxa costuma escrever "9.75", no formato americano.
    expect(parseDecimalBR('9.75')).toBe(9.75);
    expect(parseDecimalBR('0.5')).toBe(0.5);
  });

  it('devolve NaN para o que não é número, para o schema recusar', () => {
    for (const invalid of ['', '   ', 'abc', '1,2,3', '12a', '1.2.3,4,5', '-']) {
      expect(parseDecimalBR(invalid)).toBeNaN();
    }
  });

  it('aceita negativos, para o schema dar a mensagem de "maior que zero"', () => {
    expect(parseDecimalBR('-10,5')).toBe(-10.5);
  });
});
