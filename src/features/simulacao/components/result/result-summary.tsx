import { formatCurrency, formatPercent } from '@/lib/format';

import type { Simulation } from '../../services/simulation-service';

interface Tile {
  readonly label: string;
  readonly value: string;
  readonly note?: string;
}

/** Os números principais da simulação, em destaque. */
export function ResultSummary({ simulation }: { simulation: Simulation }) {
  const tiles: Tile[] = [
    { label: 'Valor financiado', value: formatCurrency(simulation.financedAmountCents) },
    {
      label: 'Primeira parcela',
      value: formatCurrency(simulation.firstInstallmentCents),
      note: 'Com seguros e taxa de administração',
    },
    { label: 'Última parcela', value: formatCurrency(simulation.lastInstallmentCents) },
    { label: 'Total pago', value: formatCurrency(simulation.summary.totalPaid) },
    { label: 'Total de juros', value: formatCurrency(simulation.summary.totalInterest) },
    {
      label: 'Custo efetivo total (CET)',
      value: `${formatPercent(simulation.cet.annualRate)} a.a.`,
      note: `Taxa contratada: ${formatPercent(simulation.input.annualRate)} a.a.`,
    },
  ];

  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tiles.map((tile) => (
        <div key={tile.label} className="flex flex-col gap-1 rounded-xl border p-4">
          <dt className="text-muted-foreground text-sm">{tile.label}</dt>
          <dd className="text-2xl font-semibold tracking-tight">{tile.value}</dd>
          {tile.note && <dd className="text-muted-foreground text-xs">{tile.note}</dd>}
        </div>
      ))}
    </dl>
  );
}
