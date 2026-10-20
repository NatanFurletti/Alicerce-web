import type { Metadata } from 'next';
import { Suspense } from 'react';

import { PageSkeleton } from '@/components/page-skeleton';
import { SimulationHistory } from '@/features/historico/components/simulation-history';

export const metadata: Metadata = { title: 'Histórico' };

export default function HistoryPage() {
  return (
    // O histórico lê `?pagina=`, que só existe na requisição.
    <Suspense fallback={<PageSkeleton />}>
      <SimulationHistory />
    </Suspense>
  );
}
