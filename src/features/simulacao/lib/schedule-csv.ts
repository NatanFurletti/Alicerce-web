import type { ScheduleEntry } from '../services/simulation-service';

/**
 * Tabela de amortização em CSV, no formato que o Excel em português abre direto.
 *
 * - **`;` como separador**: no Brasil a vírgula é decimal, e o Excel pt-BR espera `;`.
 * - **Vírgula decimal e sem separador de milhar**: "400000,00" é lido como número;
 *   "400.000,00" viraria texto e não somaria.
 * - **BOM no início**: sem ele, o Excel abre o arquivo como Windows-1252 e "Mês" vira
 *   "MÃªs".
 * - **CRLF**: o fim de linha do RFC 4180, que todo leitor de CSV aceita.
 */

const BOM = '\uFEFF';
const SEPARATOR = ';';
const LINE_BREAK = '\r\n';

const COLUMNS: readonly [string, (entry: ScheduleEntry) => string][] = [
  ['Mês', (entry) => String(entry.month)],
  ['Saldo inicial', (entry) => reais(entry.openingBalance)],
  ['Juros', (entry) => reais(entry.interest)],
  ['Amortização', (entry) => reais(entry.amortization)],
  ['Aporte extra', (entry) => reais(entry.extraPayment)],
  ['MIP', (entry) => reais(entry.mip)],
  ['DFI', (entry) => reais(entry.dfi)],
  ['Taxa de administração', (entry) => reais(entry.adminFee)],
  ['Prestação', (entry) => reais(entry.installment)],
  ['Total pago no mês', (entry) => reais(entry.totalPayment)],
  ['Saldo final', (entry) => reais(entry.closingBalance)],
];

/** Centavos inteiros para reais com vírgula: 311376 → "3113,76". Sem float no meio. */
function reais(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const absolute = Math.abs(cents);
  const units = Math.trunc(absolute / 100);
  const fraction = String(absolute % 100).padStart(2, '0');
  return `${sign}${units},${fraction}`;
}

export function scheduleToCsv(entries: readonly ScheduleEntry[]): string {
  const header = COLUMNS.map(([title]) => title).join(SEPARATOR);
  const rows = entries.map((entry) =>
    COLUMNS.map(([, format]) => format(entry)).join(SEPARATOR),
  );
  return BOM + [header, ...rows].join(LINE_BREAK);
}
