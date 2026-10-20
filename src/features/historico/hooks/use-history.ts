'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

// O histórico é uma visão das simulações: usa as mesmas chaves de cache, para que criar
// uma simulação no wizard e excluir uma aqui afetem o mesmo cache.
import { simulationKeys } from '@/features/simulacao/hooks/query-keys';

import { deleteSimulation, listSimulations } from '../services/history-service';

export const HISTORY_PAGE_SIZE = 10;

export function useSimulationList(page: number) {
  return useQuery({
    queryKey: simulationKeys.list(page),
    queryFn: () => listSimulations(page, HISTORY_PAGE_SIZE),
    placeholderData: keepPreviousData,
  });
}

export function useDeleteSimulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSimulation,
    onSuccess: (_result, id) => {
      // A lista mudou em todas as páginas (os itens "sobem"), e o detalhe excluído não
      // pode mais ser servido do cache.
      void queryClient.invalidateQueries({ queryKey: simulationKeys.lists() });
      queryClient.removeQueries({ queryKey: simulationKeys.detail(id) });
    },
  });
}
