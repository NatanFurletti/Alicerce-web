'use client';

import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';

import { mergeSchedulePages, schedulePageNumbers } from '../lib/schedule-pages';
import type { CreateSimulationBody } from '../lib/to-request';
import {
  compareSystems,
  getSchedulePage,
  getSimulation,
  type ScheduleEntry,
  type SchedulePage,
} from '../services/simulation-service';
import { simulationKeys } from './query-keys';

/**
 * Tabela e comparação são funções determinísticas dos parâmetros: não mudam enquanto a
 * simulação existir. `Infinity` evita refazer a busca a cada foco na janela.
 */
const DETERMINISTIC = Infinity;

/** Linhas por página na tabela da tela: 12 = um ano do contrato por página. */
export const TABLE_PAGE_SIZE = 12;
/** Máximo da API por página, usado para buscar a tabela inteira. */
const FULL_SCHEDULE_PAGE_SIZE = 100;

export function useSimulation(id: string) {
  return useQuery({
    queryKey: simulationKeys.detail(id),
    queryFn: () => getSimulation(id),
  });
}

export function useSchedulePage(id: string, page: number) {
  return useQuery({
    queryKey: simulationKeys.schedulePage(id, page, TABLE_PAGE_SIZE),
    queryFn: () => getSchedulePage(id, page, TABLE_PAGE_SIZE),
    staleTime: DETERMINISTIC,
    // Ao trocar de página, a anterior fica na tela até a nova chegar: a tabela não
    // pisca nem muda de altura.
    placeholderData: keepPreviousData,
  });
}

export interface FullScheduleResult {
  readonly data: ScheduleEntry[] | undefined;
  readonly isPending: boolean;
  readonly error: Error | null;
}

/**
 * A tabela inteira, para gráficos e CSV. As páginas de 100 são pedidas em paralelo e
 * juntadas em ordem de mês. Gráficos e exportação usam as mesmas chaves, então a
 * tabela é buscada uma vez só.
 */
export function useFullSchedule(id: string, months: number): FullScheduleResult {
  return useQueries({
    queries: schedulePageNumbers(months, FULL_SCHEDULE_PAGE_SIZE).map((page) => ({
      queryKey: simulationKeys.schedulePage(id, page, FULL_SCHEDULE_PAGE_SIZE),
      queryFn: () => getSchedulePage(id, page, FULL_SCHEDULE_PAGE_SIZE),
      staleTime: DETERMINISTIC,
    })),
    combine: (results) => {
      const error = results.find((result) => result.error)?.error ?? null;
      const pages = results
        .map((result) => result.data)
        .filter((page): page is SchedulePage => page !== undefined);
      const complete = pages.length === results.length;
      return {
        data: complete ? mergeSchedulePages(pages) : undefined,
        isPending: !complete && error === null,
        error,
      };
    },
  });
}

export function useComparison(input: CreateSimulationBody) {
  return useQuery({
    queryKey: simulationKeys.comparison(input),
    queryFn: () => compareSystems(input),
    staleTime: DETERMINISTIC,
  });
}
