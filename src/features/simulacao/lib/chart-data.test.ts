import { describe, expect, it } from 'vitest';

import type { ScheduleEntry } from '../services/simulation-service';
import { toBalanceSeries, toCompositionSeries, yearTicks } from './chart-data';

const entry = (month: number, opening: number, closing: number): ScheduleEntry => ({
  month,
  openingBalance: opening,
  interest: 300_00,
  amortization: opening - closing,
  extraPayment: 0,
  mip: 10_00,
  dfi: 2_50,
  adminFee: 25_00,
  installment: 0,
  totalPayment: 0,
  closingBalance: closing,
});

const schedule = [entry(1, 100_000_00, 90_000_00), entry(2, 90_000_00, 80_000_00)];

describe('toBalanceSeries', () => {
  it('começa no mês 0 com o valor financiado e segue pelo saldo ao fim de cada mês', () => {
    // Sem o mês 0, o gráfico começaria já abaixo do valor financiado.
    expect(toBalanceSeries(schedule)).toEqual([
      { month: 0, balance: 100_000 },
      { month: 1, balance: 90_000 },
      { month: 2, balance: 80_000 },
    ]);
  });

  it('tabela vazia gera série vazia', () => {
    expect(toBalanceSeries([])).toEqual([]);
  });
});

describe('toCompositionSeries', () => {
  it('separa a parcela em amortização, juros e encargos, em reais', () => {
    expect(toCompositionSeries(schedule)[0]).toEqual({
      month: 1,
      amortization: 10_000,
      interest: 300,
      charges: 37.5,
    });
  });

  it('um ponto por mês', () => {
    expect(toCompositionSeries(schedule).map((point) => point.month)).toEqual([1, 2]);
  });
});

describe('yearTicks', () => {
  it('prazos longos ganham uma marca a cada 5 anos', () => {
    expect(yearTicks(360)).toEqual([0, 60, 120, 180, 240, 300, 360]);
  });

  it('prazos de até 10 anos ganham uma marca por ano', () => {
    expect(yearTicks(36)).toEqual([0, 12, 24, 36]);
  });

  it('não passa do fim do prazo quando ele não fecha em ano redondo', () => {
    expect(yearTicks(125)).toEqual([0, 60, 120]);
  });
});
