import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Resultado' };

/** Provisória: a página de resultado completa chega na etapa 5. */
export default async function SimulationResultPage({
  params,
}: PageProps<'/simulacoes/[id]'>) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Simulação criada</h1>
      <p className="text-muted-foreground mt-2">
        A simulação <code className="text-xs">{id}</code> foi salva. O resultado completo
        chega na próxima etapa.
      </p>
      <Link href="/simular" className="mt-6 inline-block underline underline-offset-4">
        Fazer outra simulação
      </Link>
    </main>
  );
}
