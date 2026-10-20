import type { Metadata } from 'next';

import { SimulationWizard } from '@/features/simulacao/components/simulation-wizard';

export const metadata: Metadata = { title: 'Simular' };

export default function SimulatePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">
        Simular financiamento
      </h1>
      <SimulationWizard />
    </main>
  );
}
