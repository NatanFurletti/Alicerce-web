import { describe, expect, it } from 'vitest';

import { formatCurrency, formatDate, formatPercent, formatTerm } from './format';

// O Intl separa "R$" do valor com espaço não separável (U+00A0), não com espaço comum.
const NBSP = ' ';

describe('formatCurrency', () => {
  it('formata centavos como reais, com milhar em ponto e decimal em vírgula', () => {
    expect(formatCurrency(437_432)).toBe(`R$${NBSP}4.374,32`);
    expect(formatCurrency(50_000_000)).toBe(`R$${NBSP}500.000,00`);
  });

  it('formata zero e valores menores que um real', () => {
    expect(formatCurrency(0)).toBe(`R$${NBSP}0,00`);
    expect(formatCurrency(5)).toBe(`R$${NBSP}0,05`);
  });
});

describe('formatPercent', () => {
  it('recebe fração decimal e exibe percentual com duas casas', () => {
    expect(formatPercent(0.0975)).toBe(`9,75%`);
    expect(formatPercent(0.8)).toBe(`80,00%`);
  });

  it('aceita outro número de casas', () => {
    expect(formatPercent(0.103058, 4)).toBe(`10,3058%`);
    expect(formatPercent(0.3, 0)).toBe(`30%`);
  });
});

describe('formatDate', () => {
  it('usa dia/mês/ano no fuso de Brasília', () => {
    expect(formatDate('2026-10-19T12:00:00Z')).toBe('19/10/2026');
  });

  it('não pula para o dia seguinte quando é madrugada em UTC', () => {
    // 01:00 UTC ainda é 22:00 do dia anterior em Brasília.
    expect(formatDate('2026-10-20T01:00:00Z')).toBe('19/10/2026');
  });
});

describe('formatTerm', () => {
  it('mostra meses e a leitura em anos', () => {
    expect(formatTerm(360)).toBe('360 meses (30 anos)');
    expect(formatTerm(12)).toBe('12 meses (1 ano)');
  });

  it('inclui os meses que sobram', () => {
    expect(formatTerm(125)).toBe('125 meses (10 anos e 5 meses)');
    expect(formatTerm(13)).toBe('13 meses (1 ano e 1 mês)');
  });

  it('prazos curtos ficam só em meses', () => {
    expect(formatTerm(1)).toBe('1 mês');
    expect(formatTerm(11)).toBe('11 meses');
  });
});
