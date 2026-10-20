'use client';

import { Download } from 'lucide-react';
import Link from 'next/link';

import { ErrorState } from '@/components/error-state';
import { PageSkeleton } from '@/components/page-skeleton';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/api/errors';
import { downloadTextFile } from '@/lib/download';
import { formatDate, formatPercent, formatTerm } from '@/lib/format';

import { useFullSchedule, useSimulation } from '../../hooks/use-simulation-result';
import { scheduleToCsv } from '../../lib/schedule-csv';
import type { Simulation } from '../../services/simulation-service';
import { ComparisonCard } from './comparison-card';
import { IncomeCommitmentCard } from './income-commitment-card';
import { ResultSummary } from './result-summary';
import { BalanceChart, CompositionChart } from './result-charts';
import { ScheduleTable } from './schedule-table';

const SYSTEM_LABEL = { SAC: 'SAC', PRICE: 'Price' } as const;

/** Página de resultado: carrega a simulação e decide entre carregando, erro e conteúdo. */
export function SimulationResult({ id }: { id: string }) {
  const simulation = useSimulation(id);

  if (simulation.isPending) return <PageSkeleton />;

  if (simulation.isError) {
    const notFound =
      simulation.error instanceof ApiError &&
      simulation.error.code === 'SIMULATION_NOT_FOUND';
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          {notFound
            ? 'Simulação não encontrada'
            : 'Não foi possível carregar a simulação'}
        </h1>
        {notFound ? (
          <p className="text-muted-foreground">
            Ela pode ter sido excluída, ou o endereço está incorreto.
          </p>
        ) : (
          <ErrorState
            error={simulation.error}
            onRetry={() => void simulation.refetch()}
          />
        )}
        <div className="flex gap-3">
          <Link href="/simulacoes" className={buttonVariants({ variant: 'outline' })}>
            Ver histórico
          </Link>
          <Link href="/simular" className={buttonVariants()}>
            Nova simulação
          </Link>
        </div>
      </main>
    );
  }

  return <SimulationResultView simulation={simulation.data} />;
}

function SimulationResultView({ simulation }: { simulation: Simulation }) {
  const { input } = simulation;
  const fullSchedule = useFullSchedule(simulation.id, simulation.summary.months);

  function exportCsv() {
    if (!fullSchedule.data) return;
    downloadTextFile(`simulacao-${simulation.id}.csv`, scheduleToCsv(fullSchedule.data));
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Resultado da simulação
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {SYSTEM_LABEL[input.amortizationSystem]} · {formatTerm(simulation.termMonths)}{' '}
            · {formatPercent(input.annualRate)} a.a. · simulada em{' '}
            {formatDate(simulation.createdAt)}
          </p>
        </div>
        <Link href="/simular" className={buttonVariants({ variant: 'outline' })}>
          Nova simulação
        </Link>
      </header>

      <ResultSummary simulation={simulation} />

      <IncomeCommitmentCard
        firstInstallmentCents={simulation.firstInstallmentCents}
        monthlyIncomeCents={input.monthlyIncomeCents}
      />

      <ComparisonCard input={input} />

      <section aria-labelledby="graficos-titulo" className="flex flex-col gap-3">
        <h2 id="graficos-titulo" className="text-lg font-semibold tracking-tight">
          Gráficos
        </h2>
        {fullSchedule.error ? (
          <ErrorState error={fullSchedule.error} />
        ) : fullSchedule.data ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <BalanceChart schedule={fullSchedule.data} />
            <CompositionChart schedule={fullSchedule.data} />
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        )}
      </section>

      <section aria-labelledby="tabela-titulo" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="tabela-titulo" className="text-lg font-semibold tracking-tight">
            Tabela de amortização
          </h2>
          <Button
            variant="outline"
            onClick={exportCsv}
            disabled={!fullSchedule.data}
            aria-describedby="csv-ajuda"
          >
            <Download aria-hidden />
            Exportar CSV
          </Button>
        </div>
        <p id="csv-ajuda" className="text-muted-foreground text-xs">
          O CSV traz todos os {simulation.summary.months} meses e abre direto no Excel.
        </p>
        <ScheduleTable simulationId={simulation.id} months={simulation.summary.months} />
      </section>
    </main>
  );
}
