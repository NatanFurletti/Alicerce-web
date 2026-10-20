import { CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react';

import { formatCurrency, formatPercent } from '@/lib/format';

import {
  type CommitmentLevel,
  incomeCommitment,
  REFERENCE_LIMIT_RATIO,
} from '../../lib/income-commitment';

const LEVELS: Record<
  CommitmentLevel,
  { title: string; icon: typeof CircleCheck; color: string; message: string }
> = {
  ok: {
    title: 'Dentro da referência',
    icon: CircleCheck,
    color: 'var(--status-good)',
    message: 'A parcela cabe com folga na renda informada.',
  },
  attention: {
    title: 'Perto do limite',
    icon: TriangleAlert,
    color: 'var(--status-warning)',
    message:
      'A parcela está perto do limite de referência de 30%. Imprevistos na renda podem apertar o orçamento.',
  },
  exceeded: {
    title: 'Acima de 30% da renda',
    icon: CircleAlert,
    color: 'var(--status-critical)',
    message:
      'A parcela passa do limite de referência de 30% da renda. Bancos costumam recusar o financiamento nessa condição.',
  },
};

/** A escala do medidor vai até 50%: espaço para mostrar quanto passou do limite. */
const METER_MAX_RATIO = 0.5;

/**
 * Quanto da renda a primeira parcela compromete.
 *
 * O nível é comunicado por ícone, título e texto, e a cor só reforça. Quem não
 * distingue as cores, ou usa leitor de tela, recebe a mesma informação.
 */
export function IncomeCommitmentCard({
  firstInstallmentCents,
  monthlyIncomeCents,
}: {
  firstInstallmentCents: number;
  monthlyIncomeCents: number | undefined;
}) {
  const commitment = incomeCommitment(firstInstallmentCents, monthlyIncomeCents);

  if (commitment === null || monthlyIncomeCents === undefined) {
    return (
      <section aria-labelledby="renda-titulo" className="rounded-xl border p-4">
        <h2 id="renda-titulo" className="font-semibold">
          Comprometimento da renda
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          A renda não foi informada nesta simulação. Informe-a na próxima para ver quanto
          dela a parcela compromete.
        </p>
      </section>
    );
  }

  const level = LEVELS[commitment.level];
  const Icon = level.icon;
  const percent = formatPercent(commitment.ratio, 1);
  const fill = Math.min(commitment.ratio / METER_MAX_RATIO, 1) * 100;
  const limitPosition = (REFERENCE_LIMIT_RATIO / METER_MAX_RATIO) * 100;

  return (
    <section
      aria-labelledby="renda-titulo"
      className="flex flex-col gap-3 rounded-xl border p-4"
    >
      <h2 id="renda-titulo" className="font-semibold">
        Comprometimento da renda
      </h2>
      <p className="flex items-center gap-2 font-medium">
        <Icon aria-hidden className="size-5 shrink-0" style={{ color: level.color }} />
        {level.title}: {percent} da renda
      </p>

      <div
        role="meter"
        aria-label="Comprometimento da renda"
        aria-valuemin={0}
        aria-valuemax={METER_MAX_RATIO * 100}
        aria-valuenow={Number((commitment.ratio * 100).toFixed(1))}
        aria-valuetext={percent}
        className="bg-muted relative h-2 rounded-full"
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${fill}%`, backgroundColor: level.color }}
        />
        <div
          aria-hidden
          className="bg-foreground absolute -top-1 h-4 w-0.5"
          style={{ left: `${limitPosition}%` }}
          title="Limite de referência: 30%"
        />
      </div>

      <p className="text-muted-foreground text-sm">
        A primeira parcela, de {formatCurrency(firstInstallmentCents)}, compromete{' '}
        {percent} da renda informada de {formatCurrency(monthlyIncomeCents)}.{' '}
        {level.message}
      </p>
    </section>
  );
}
