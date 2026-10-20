import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

const FEATURES = [
  {
    title: 'SAC e Price lado a lado',
    description:
      'Veja como a parcela inicial e o total de juros mudam entre os dois sistemas, com os mesmos números.',
  },
  {
    title: 'Custo efetivo total',
    description:
      'Além da taxa de juros, o CET inclui seguros e taxa de administração: é o número que permite comparar propostas.',
  },
  {
    title: 'Tabela completa',
    description:
      'Cada parcela, mês a mês: juros, amortização, seguros e saldo devedor. Exportável em CSV.',
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-4 py-16 sm:py-24">
      <section className="flex max-w-2xl flex-col gap-6">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Entenda seu financiamento imobiliário antes de assinar
        </h1>
        <p className="text-muted-foreground text-lg text-pretty">
          Simuladores de banco mostram só a parcela. O Alicerce mostra a conta inteira:
          quanto de cada parcela é juros, quanto é seguro e quanto realmente abate a
          dívida.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/simular" className={buttonVariants({ size: 'lg' })}>
            Simular financiamento
          </Link>
          <Link
            href="/cadastrar"
            className={buttonVariants({ size: 'lg', variant: 'outline' })}
          >
            Criar conta
          </Link>
        </div>
      </section>

      <section aria-labelledby="recursos" className="flex flex-col gap-6">
        <h2 id="recursos" className="text-xl font-semibold tracking-tight">
          O que a simulação mostra
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="rounded-xl border p-5">
              <h3 className="font-medium">{feature.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{feature.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-muted-foreground text-xs">
        Simulação com valores de referência de mercado. Não é proposta de crédito: taxas,
        seguros e limites variam por banco.
      </p>
    </main>
  );
}
