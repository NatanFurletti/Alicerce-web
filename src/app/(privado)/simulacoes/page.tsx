import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Histórico' };

export default function HistoryPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Suas simulações</h1>
      <p className="text-muted-foreground mt-2">O histórico chega numa próxima etapa.</p>
    </main>
  );
}
