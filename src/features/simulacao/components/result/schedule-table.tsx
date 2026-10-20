'use client';

import { useState } from 'react';

import { ErrorState } from '@/components/error-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/format';

import { TABLE_PAGE_SIZE, useSchedulePage } from '../../hooks/use-simulation-result';

const COLUMNS = [
  'Mês',
  'Parcela total',
  'Juros',
  'Amortização',
  'Seguros e taxa',
  'Saldo devedor',
];

/**
 * Tabela de amortização paginada, um ano por página.
 *
 * Cada página é uma requisição à API (`?page=N&pageSize=12`). Enquanto a próxima
 * chega, a anterior continua visível e esmaecida, sem a tabela piscar.
 */
export function ScheduleTable({
  simulationId,
  months,
}: {
  simulationId: string;
  months: number;
}) {
  const [page, setPage] = useState(1);
  const schedule = useSchedulePage(simulationId, page);
  const totalPages = Math.ceil(months / TABLE_PAGE_SIZE);

  if (schedule.isError && !schedule.data) {
    return <ErrorState error={schedule.error} onRetry={() => void schedule.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="overflow-x-auto rounded-xl border"
        // Rolável por teclado no celular: sem foco, quem não usa mouse não alcança as
        // colunas da direita.
        tabIndex={0}
        role="region"
        aria-labelledby="tabela-legenda"
      >
        <table
          className={`w-full min-w-[40rem] text-sm transition-opacity ${schedule.isPlaceholderData ? 'opacity-60' : ''}`}
          aria-busy={schedule.isFetching}
        >
          <caption id="tabela-legenda" className="sr-only">
            Tabela de amortização, ano {page} de {totalPages}
          </caption>
          <thead className="bg-muted/50">
            <tr>
              {COLUMNS.map((column, index) => (
                <th
                  key={column}
                  scope="col"
                  className={`p-3 font-medium ${index === 0 ? 'text-left' : 'text-right'}`}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.data
              ? schedule.data.items.map((entry) => (
                  <tr key={entry.month} className="border-t">
                    <th scope="row" className="p-3 text-left font-normal tabular-nums">
                      {entry.month}
                    </th>
                    <td className="p-3 text-right tabular-nums">
                      {formatCurrency(entry.totalPayment)}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {formatCurrency(entry.interest)}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {formatCurrency(entry.amortization)}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {formatCurrency(entry.mip + entry.dfi + entry.adminFee)}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {formatCurrency(entry.closingBalance)}
                    </td>
                  </tr>
                ))
              : Array.from({ length: TABLE_PAGE_SIZE }, (_, index) => (
                  <tr key={index} className="border-t">
                    <td colSpan={COLUMNS.length} className="p-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <nav
        aria-label="Paginação da tabela"
        className="flex items-center justify-between gap-3"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
        >
          Ano anterior
        </Button>
        <p className="text-muted-foreground text-sm" aria-live="polite">
          Ano {page} de {totalPages}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
        >
          Próximo ano
        </Button>
      </nav>
    </div>
  );
}
