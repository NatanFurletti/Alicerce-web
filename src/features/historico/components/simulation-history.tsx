'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';

import { ErrorState } from '@/components/error-state';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getErrorMessage } from '@/lib/api/errors';
import { formatCurrency, formatDate, formatPercent, formatTerm } from '@/lib/format';

import {
  HISTORY_PAGE_SIZE,
  useDeleteSimulation,
  useSimulationList,
} from '../hooks/use-history';
import {
  pageAfterDeletion,
  pageSummary,
  parsePageParam,
} from '../lib/history-pagination';
import type { SimulationListItem } from '../services/history-service';

const SYSTEM_LABEL = { SAC: 'SAC', PRICE: 'Price' } as const;

/**
 * Histórico de simulações do usuário.
 *
 * A página atual fica na URL (`?pagina=2`): voltar no navegador e compartilhar o link
 * funcionam como esperado.
 */
export function SimulationHistory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = parsePageParam(searchParams.get('pagina'));

  const list = useSimulationList(page);
  const deletion = useDeleteSimulation();
  const [toDelete, setToDelete] = useState<SimulationListItem | null>(null);
  const [status, setStatus] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);

  function goToPage(target: number) {
    router.replace(target === 1 ? pathname : `${pathname}?pagina=${target}`);
  }

  function confirmDeletion() {
    if (toDelete === null || list.data === undefined) return;
    const total = list.data.total;
    deletion.mutate(toDelete.id, {
      onSuccess: () => {
        setToDelete(null);
        // Anunciado por uma região aria-live: quem usa leitor de tela fica sabendo que
        // deu certo, e o foco volta para o título, já que o item excluído sumiu.
        setStatus('Simulação excluída.');
        headingRef.current?.focus();
        const target = pageAfterDeletion({ total, page, pageSize: HISTORY_PAGE_SIZE });
        if (target !== page) goToPage(target);
      },
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-semibold tracking-tight outline-none sm:text-3xl"
        >
          Suas simulações
        </h1>
        <Link href="/simular" className={buttonVariants()}>
          Nova simulação
        </Link>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>

      {list.isPending && <HistorySkeleton />}

      {list.isError && !list.data && (
        <ErrorState error={list.error} onRetry={() => void list.refetch()} />
      )}

      {list.data && list.data.total === 0 && (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed p-8">
          <h2 className="font-semibold">Nenhuma simulação ainda</h2>
          <p className="text-muted-foreground text-sm">
            Suas simulações ficam salvas aqui para você consultar e comparar depois.
          </p>
          <Link href="/simular" className={buttonVariants({ variant: 'outline' })}>
            Fazer a primeira simulação
          </Link>
        </div>
      )}

      {list.data && list.data.total > 0 && (
        <>
          <ul
            className={`flex flex-col gap-3 transition-opacity ${list.isPlaceholderData ? 'opacity-60' : ''}`}
            aria-busy={list.isFetching}
          >
            {list.data.items.map((item) => (
              <HistoryItem key={item.id} item={item} onDelete={() => setToDelete(item)} />
            ))}
          </ul>
          <HistoryPagination
            total={list.data.total}
            page={page}
            onPageChange={goToPage}
          />
        </>
      )}

      <AlertDialog
        open={toDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletion.isPending) {
            setToDelete(null);
            deletion.reset();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir simulação?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete &&
                `A simulação de ${formatCurrency(toDelete.propertyValueCents)}, feita em ${formatDate(toDelete.createdAt)}, será excluída. Não dá para desfazer.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deletion.isError && (
            <Alert variant="destructive">
              <AlertDescription>{getErrorMessage(deletion.error)}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletion.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDeletion}
              disabled={deletion.isPending}
            >
              {deletion.isPending ? 'Excluindo…' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function HistoryItem({
  item,
  onDelete,
}: {
  item: SimulationListItem;
  onDelete: () => void;
}) {
  const title = `Imóvel de ${formatCurrency(item.propertyValueCents)}`;

  return (
    <li className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <h2 className="font-medium">
          <Link
            href={`/simulacoes/${item.id}`}
            className="underline-offset-4 hover:underline"
          >
            {title}
          </Link>
        </h2>
        <p className="text-muted-foreground text-sm">
          Financiado {formatCurrency(item.financedAmountCents)} ·{' '}
          {SYSTEM_LABEL[item.amortizationSystem]} · {formatTerm(item.termMonths)} ·{' '}
          {formatPercent(item.annualRate)} a.a.
        </p>
        <p className="text-muted-foreground text-xs">
          Simulada em {formatDate(item.createdAt)}
        </p>
      </div>
      <div className="flex gap-2">
        <Link
          href={`/simulacoes/${item.id}`}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
          aria-label={`Ver resultado: ${title}`}
        >
          Ver resultado
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          aria-label={`Excluir: ${title}, simulada em ${formatDate(item.createdAt)}`}
        >
          Excluir
        </Button>
      </div>
    </li>
  );
}

function HistoryPagination({
  total,
  page,
  onPageChange,
}: {
  total: number;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const summary = pageSummary({ total, page, pageSize: HISTORY_PAGE_SIZE });

  return (
    <nav
      aria-label="Paginação do histórico"
      className="flex items-center justify-between gap-3"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={!summary.hasPrevious}
      >
        Anterior
      </Button>
      <p className="text-muted-foreground text-sm">
        {summary.from}–{summary.to} de {total}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={!summary.hasNext}
      >
        Próxima
      </Button>
    </nav>
  );
}

function HistorySkeleton() {
  return (
    <ul className="flex flex-col gap-3" role="status" aria-label="Carregando simulações">
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index} className="flex flex-col gap-2 rounded-xl border p-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-32" />
        </li>
      ))}
    </ul>
  );
}
