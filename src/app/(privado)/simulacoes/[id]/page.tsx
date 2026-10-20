import type { Metadata } from 'next';

import { SimulationResult } from '@/features/simulacao/components/result/simulation-result';

export const metadata: Metadata = { title: 'Resultado' };

export default async function SimulationResultPage({
  params,
}: PageProps<'/simulacoes/[id]'>) {
  const { id } = await params;
  return <SimulationResult id={id} />;
}
