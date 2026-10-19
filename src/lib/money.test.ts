import { describe, expect, it } from 'vitest';

import { percentToRate, rateToPercent, toCents, toReais } from './money';

function decimalPlaces(value: number): number {
  return value.toString().split('.')[1]?.length ?? 0;
}

describe('toCents', () => {
  it('converte reais em centavos inteiros', () => {
    expect(toCents(500_000)).toBe(50_000_000);
    expect(toCents(0)).toBe(0);
  });

  it('não perde o centavo no caso clássico de ponto flutuante', () => {
    expect(19.99 * 100).not.toBe(1999);
    expect(toCents(19.99)).toBe(1999);
  });
});

describe('toReais', () => {
  it('converte centavos em reais', () => {
    expect(toReais(437_432)).toBe(4374.32);
  });
});

describe('percentToRate', () => {
  it('converte percentual em decimal', () => {
    expect(percentToRate(9.75)).toBe(0.0975);
    expect(percentToRate(0)).toBe(0);
    expect(percentToRate(100)).toBe(1);
  });

  it('nunca gera mais casas decimais do que a API aceita (10)', () => {
    // Divisão pura produziria dízimas binárias que a API rejeita com 400.
    expect(0.07 / 100).not.toBe(0.0007);

    for (const percent of [0.07, 9.7, 10.35, 11.29, 0.025, 0.005]) {
      expect(decimalPlaces(percentToRate(percent))).toBeLessThanOrEqual(10);
    }
    expect(percentToRate(0.07)).toBe(0.0007);
  });
});

describe('rateToPercent', () => {
  it('é o inverso de percentToRate', () => {
    for (const percent of [9.75, 0.025, 12, 0.005]) {
      expect(rateToPercent(percentToRate(percent))).toBe(percent);
    }
  });
});
