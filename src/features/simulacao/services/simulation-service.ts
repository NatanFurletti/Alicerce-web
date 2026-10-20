import { api, unwrap } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

import type { CreateSimulationBody } from '../lib/to-request';

/** Chamadas de simulação à API. Única parte da feature que conhece HTTP. */

export type Simulation = components['schemas']['SimulationResponseDto'];

export function createSimulation(body: CreateSimulationBody): Promise<Simulation> {
  return unwrap(api.POST('/simulations', { body }));
}
