/**
 * Formatação para exibição, sempre em pt-BR.
 *
 * Os formatadores do `Intl` são criados uma vez, no carregamento do módulo: montar um
 * `Intl.NumberFormat` é caro, e uma tabela de 420 linhas chamaria isso milhares de
 * vezes.
 */

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  // Fuso fixo: sem ele, a mesma data apareceria diferente no servidor (UTC) e no
  // navegador, e o React acusaria divergência de hidratação.
  timeZone: 'America/Sao_Paulo',
});

const percentFormatters = new Map<number, Intl.NumberFormat>();

/** Centavos inteiros para moeda: 437432 → "R$ 4.374,32". */
export function formatCurrency(cents: number): string {
  return currency.format(cents / 100);
}

/**
 * Fração decimal para percentual: 0.0975 → "9,75%".
 *
 * Recebe a fração, e não o percentual, porque é assim que a API entrega taxas, LTV e
 * CET. O formatador fica em cache por número de casas.
 */
export function formatPercent(fraction: number, fractionDigits = 2): string {
  let formatter = percentFormatters.get(fractionDigits);
  if (formatter === undefined) {
    formatter = new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    percentFormatters.set(fractionDigits, formatter);
  }
  return formatter.format(fraction);
}

/** Data ISO para o formato brasileiro: "2026-10-19T23:12:01Z" → "19/10/2026". */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/** Prazo em meses, com a leitura em anos: 360 → "360 meses (30 anos)". */
export function formatTerm(months: number): string {
  const base = plural(months, 'mês', 'meses');
  const years = Math.floor(months / 12);
  if (years === 0) return base;

  const rest = months % 12;
  const inYears =
    rest === 0
      ? plural(years, 'ano', 'anos')
      : `${plural(years, 'ano', 'anos')} e ${plural(rest, 'mês', 'meses')}`;

  return `${base} (${inYears})`;
}
