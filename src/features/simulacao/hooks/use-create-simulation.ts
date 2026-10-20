'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createSimulation } from '../services/simulation-service';
import { simulationKeys } from './query-keys';

export function useCreateSimulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSimulation,
    onSuccess: (simulation) => {
      // A resposta da criação já é o resumo: guardar no cache poupa a página de
      // resultado de buscar de novo o que acabou de chegar.
      queryClient.setQueryData(simulationKeys.detail(simulation.id), simulation);
      // O histórico ganhou um item.
      void queryClient.invalidateQueries({ queryKey: simulationKeys.lists() });
    },
  });
}
