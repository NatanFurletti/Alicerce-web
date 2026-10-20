'use client';

import { useWatch } from 'react-hook-form';

import { formatCurrency, formatPercent } from '@/lib/format';
import { toCents } from '@/lib/money';

import { financingPreview, REFERENCE_MAX_LTV } from '../lib/financing-preview';
import type { SimulationFormInput } from '../schemas/simulation-form';

/** Resumo ao vivo do que está sendo financiado, ao lado do formulário. */
export function FinancingSummary() {
  const [propertyValue, downPayment, fgts] = useWatch<
    SimulationFormInput,
    ['propertyValue', 'downPayment', 'fgts']
  >({ name: ['propertyValue', 'downPayment', 'fgts'] });
  const preview = financingPreview({ propertyValue, downPayment, fgts });

  return (
    <aside
      aria-label="Resumo do financiamento"
      className="bg-muted/40 rounded-xl border p-4"
    >
      <h2 className="text-sm font-semibold">Resumo</h2>
      {preview === null ? (
        <p className="text-muted-foreground mt-2 text-sm">
          Informe o valor do imóvel para ver quanto será financiado.
        </p>
      ) : (
        <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Imóvel</dt>
          <dd className="text-right tabular-nums">
            {formatCurrency(toCents(preview.propertyValue))}
          </dd>
          <dt className="text-muted-foreground">Entrada total</dt>
          <dd className="text-right tabular-nums">
            {formatCurrency(toCents(preview.totalDownPayment))}
          </dd>
          <dt className="font-medium">Financiado</dt>
          <dd className="text-right font-medium tabular-nums">
            {formatCurrency(toCents(preview.financedAmount))}
          </dd>
          <dt className="text-muted-foreground">Percentual financiado (LTV)</dt>
          <dd className="text-right tabular-nums">{formatPercent(preview.ltv, 1)}</dd>
        </dl>
      )}
      {preview?.exceedsReferenceLtv && (
        <p className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs">
          <strong>Atenção:</strong> acima de {formatPercent(REFERENCE_MAX_LTV, 0)} do
          valor do imóvel. Os bancos costumam exigir uma entrada maior, e a simulação pode
          ser recusada.
        </p>
      )}
    </aside>
  );
}
