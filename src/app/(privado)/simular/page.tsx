import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Simular' };

export default function SimulatePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Simular financiamento</h1>
      <p className="text-muted-foreground mt-2">O simulador chega na próxima etapa.</p>
    </main>
  );
}
