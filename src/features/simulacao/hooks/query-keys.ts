/**
 * Chaves de cache do TanStack Query para simulações, num lugar só.
 *
 * A hierarquia permite invalidar por prefixo: `simulationKeys.lists()` derruba todas as
 * páginas do histórico de uma vez, sem tocar no detalhe de cada simulação.
 */
export const simulationKeys = {
  all: ['simulations'] as const,
  lists: () => [...simulationKeys.all, 'list'] as const,
  list: (page: number) => [...simulationKeys.lists(), page] as const,
  detail: (id: string) => [...simulationKeys.all, 'detail', id] as const,
};
