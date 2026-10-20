import { api, unwrap } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

/** Chamadas do histórico à API. */

export type SimulationPage = components['schemas']['SimulationPageDto'];
export type SimulationListItem = components['schemas']['SimulationListItemDto'];

export function listSimulations(page: number, pageSize: number): Promise<SimulationPage> {
  return unwrap(api.GET('/simulations', { params: { query: { page, pageSize } } }));
}

export async function deleteSimulation(id: string): Promise<void> {
  await unwrap(api.DELETE('/simulations/{id}', { params: { path: { id } } }));
}
