import { toReais } from '@/lib/money';

import type { ScheduleEntry } from '../services/simulation-service';

/**
 * Dados dos gráficos, em reais. Os gráficos só desenham; a conversão fica aqui,
 * testada, para o eixo e o tooltip nunca mostrarem centavos por engano.
 */

export interface BalancePoint {
  readonly month: number;
  readonly balance: number;
}

export interface CompositionPoint {
  readonly month: number;
  readonly amortization: number;
  readonly interest: number;
  /** MIP + DFI + taxa de administração. */
  readonly charges: number;
}

/**
 * Evolução do saldo devedor. O ponto do mês 0 é o valor financiado (saldo de abertura
 * do mês 1); sem ele, a curva começaria já abaixo do que foi emprestado.
 */
export function toBalanceSeries(entries: readonly ScheduleEntry[]): BalancePoint[] {
  const first = entries[0];
  if (first === undefined) return [];

  return [
    { month: 0, balance: toReais(first.openingBalance) },
    ...entries.map((entry) => ({
      month: entry.month,
      balance: toReais(entry.closingBalance),
    })),
  ];
}

/** Composição de cada parcela: quanto abate a dívida, quanto é juro, quanto é encargo. */
export function toCompositionSeries(
  entries: readonly ScheduleEntry[],
): CompositionPoint[] {
  return entries.map((entry) => ({
    month: entry.month,
    amortization: toReais(entry.amortization),
    interest: toReais(entry.interest),
    charges: toReais(entry.mip + entry.dfi + entry.adminFee),
  }));
}

const MONTHS_PER_YEAR = 12;
/** Acima de 10 anos, uma marca por ano poluiria o eixo: passa a uma a cada 5 anos. */
const YEARLY_TICKS_UP_TO_MONTHS = 120;

/** Marcas do eixo do tempo, em meses, alinhadas a anos completos. */
export function yearTicks(months: number): number[] {
  const step = months > YEARLY_TICKS_UP_TO_MONTHS ? 5 * MONTHS_PER_YEAR : MONTHS_PER_YEAR;
  const ticks: number[] = [];
  for (let month = 0; month <= months; month += step) ticks.push(month);
  return ticks;
}
