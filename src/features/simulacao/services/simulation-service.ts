import { api, unwrap } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

import type { CreateSimulationBody } from '../lib/to-request';

/** Chamadas de simulação à API. Única parte da feature que conhece HTTP. */

export type Simulation = components['schemas']['SimulationResponseDto'];
export type ScheduleEntry = components['schemas']['ScheduleEntryDto'];
export type SchedulePage = components['schemas']['SchedulePageDto'];
export type Comparison = components['schemas']['CompareResponseDto'];
export type SystemComparison = components['schemas']['SystemComparisonDto'];

export function createSimulation(body: CreateSimulationBody): Promise<Simulation> {
  return unwrap(api.POST('/simulations', { body }));
}

export function getSimulation(id: string): Promise<Simulation> {
  return unwrap(api.GET('/simulations/{id}', { params: { path: { id } } }));
}

export function getSchedulePage(
  id: string,
  page: number,
  pageSize: number,
): Promise<SchedulePage> {
  return unwrap(
    api.GET('/simulations/{id}/schedule', {
      params: { path: { id }, query: { page, pageSize } },
    }),
  );
}

/**
 * SAC e Price lado a lado para os mesmos parâmetros.
 *
 * Vai **sem a renda**: a API valida o comprometimento contra os dois sistemas, e se o
 * SAC (de parcela inicial maior) passasse do limite, a comparação inteira falharia,
 * mesmo que a simulação escolhida fosse Price. O comprometimento de cada sistema é
 * calculado na tela, com `incomeCommitment`.
 */
export function compareSystems(input: CreateSimulationBody): Promise<Comparison> {
  const { monthlyIncomeCents: _ignored, ...withoutIncome } = input;
  return unwrap(api.POST('/simulations/compare', { body: withoutIncome }));
}
