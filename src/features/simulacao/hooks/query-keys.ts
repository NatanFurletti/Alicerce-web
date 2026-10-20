import type { CreateSimulationBody } from '../lib/to-request';

/**
 * Chaves de cache do TanStack Query para simulações, num lugar só.
 *
 * A hierarquia permite invalidar por prefixo: `simulationKeys.lists()` derruba todas as
 * páginas do histórico de uma vez, e `simulationKeys.detail(id)` leva junto a tabela e
 * o resumo daquela simulação.
 */
export const simulationKeys = {
  all: ['simulations'] as const,
  lists: () => [...simulationKeys.all, 'list'] as const,
  list: (page: number) => [...simulationKeys.lists(), page] as const,
  detail: (id: string) => [...simulationKeys.all, 'detail', id] as const,
  schedulePage: (id: string, page: number, pageSize: number) =>
    [...simulationKeys.detail(id), 'schedule', pageSize, page] as const,
  comparison: (input: CreateSimulationBody) =>
    [...simulationKeys.all, 'comparison', input] as const,
};
