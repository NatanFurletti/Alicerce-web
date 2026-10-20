import { describe, expect, it } from 'vitest';

import type { ScheduleEntry } from '../services/simulation-service';
import { scheduleToCsv } from './schedule-csv';

const entry = (month: number, overrides: Partial<ScheduleEntry> = {}): ScheduleEntry => ({
  month,
  openingBalance: 40_000_000,
  interest: 311_376,
  amortization: 111_111,
  extraPayment: 0,
  mip: 10_000,
  dfi: 2_500,
  adminFee: 2_500,
  installment: 422_487,
  totalPayment: 437_487,
  closingBalance: 39_888_889,
  ...overrides,
});

describe('scheduleToCsv', () => {
  it('começa com BOM, para o Excel reconhecer UTF-8 e os acentos', () => {
    expect(scheduleToCsv([entry(1)]).startsWith('\uFEFF')).toBe(true);
  });

  it('usa ponto e vírgula e cabeçalho em português', () => {
    const [header] = scheduleToCsv([entry(1)])
      .slice(1)
      .split('\r\n');

    expect(header).toBe(
      'Mês;Saldo inicial;Juros;Amortização;Aporte extra;MIP;DFI;' +
        'Taxa de administração;Prestação;Total pago no mês;Saldo final',
    );
  });

  it('escreve valores em reais com vírgula decimal e sem separador de milhar', () => {
    // O Excel em pt-BR lê "400000,00" como número; "400.000,00" viraria texto.
    const [, row] = scheduleToCsv([entry(1)])
      .slice(1)
      .split('\r\n');

    expect(row).toBe(
      '1;400000,00;3113,76;1111,11;0,00;100,00;25,00;25,00;4224,87;4374,87;398888,89',
    );
  });

  it('uma linha por mês, separadas por CRLF', () => {
    const lines = scheduleToCsv([entry(1), entry(2), entry(3)])
      .slice(1)
      .split('\r\n');

    expect(lines).toHaveLength(4);
    expect(lines.map((line) => line.split(';')[0])).toEqual(['Mês', '1', '2', '3']);
  });

  it('tabela vazia gera só o cabeçalho', () => {
    expect(scheduleToCsv([]).slice(1).split('\r\n')).toHaveLength(1);
  });
});
