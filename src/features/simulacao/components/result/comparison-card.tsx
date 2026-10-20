'use client';

import { ErrorState } from '@/components/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatPercent } from '@/lib/format';

import { useComparison } from '../../hooks/use-simulation-result';
import { incomeCommitment } from '../../lib/income-commitment';
import type { CreateSimulationBody } from '../../lib/to-request';
import type { SystemComparison } from '../../services/simulation-service';

interface Row {
  readonly label: string;
  readonly value: (system: SystemComparison) => string;
}

/** SAC e Price com os mesmos parâmetros, lado a lado. */
export function ComparisonCard({ input }: { input: CreateSimulationBody }) {
  const comparison = useComparison(input);
  const income = input.monthlyIncomeCents;

  const rows: Row[] = [
    { label: 'Primeira parcela', value: (s) => formatCurrency(s.firstInstallmentCents) },
    { label: 'Última parcela', value: (s) => formatCurrency(s.lastInstallmentCents) },
    { label: 'Total de juros', value: (s) => formatCurrency(s.summary.totalInterest) },
    { label: 'Total pago', value: (s) => formatCurrency(s.summary.totalPaid) },
    { label: 'CET', value: (s) => `${formatPercent(s.cet.annualRate)} a.a.` },
  ];
  if (income !== undefined) {
    rows.push({
      label: 'Renda comprometida',
      value: (s) => {
        const commitment = incomeCommitment(s.firstInstallmentCents, income);
        return commitment ? formatPercent(commitment.ratio, 1) : '—';
      },
    });
  }

  return (
    <section aria-labelledby="comparativo-titulo" className="flex flex-col gap-3">
      <h2 id="comparativo-titulo" className="text-lg font-semibold tracking-tight">
        SAC x Price
      </h2>

      {comparison.isPending && <Skeleton className="h-56 w-full" />}
      {comparison.isError && (
        <ErrorState error={comparison.error} onRetry={() => void comparison.refetch()} />
      )}

      {comparison.data && (
        <>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Comparação entre SAC e Price com os mesmos parâmetros
              </caption>
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="p-3 text-left font-medium">
                    <span className="sr-only">Indicador</span>
                  </th>
                  {(['SAC', 'PRICE'] as const).map((system) => (
                    <th key={system} scope="col" className="p-3 text-right font-medium">
                      {system === 'SAC' ? 'SAC' : 'Price'}
                      {input.amortizationSystem === system && (
                        <span className="text-muted-foreground block text-xs font-normal">
                          sua escolha
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-t">
                    <th scope="row" className="p-3 text-left font-normal">
                      {row.label}
                    </th>
                    <td className="p-3 text-right tabular-nums">
                      {row.value(comparison.data.sac)}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {row.value(comparison.data.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground text-sm">
            {comparison.data.interestDifferenceCents > 0
              ? `No Price, você pagaria ${formatCurrency(comparison.data.interestDifferenceCents)} a mais de juros que no SAC, em troca de começar com parcelas menores.`
              : 'Com taxa zero, os dois sistemas cobram os mesmos juros.'}
          </p>
        </>
      )}
    </section>
  );
}
