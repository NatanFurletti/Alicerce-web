/**
 * Faixas de comprometimento de renda, como **referência de mercado**.
 *
 * O limite que vale é o da API (`MAX_INCOME_COMMITMENT_PERCENT`, padrão 30%), que
 * recusa a simulação acima dele. Estas faixas servem para avisar *antes* do limite:
 * uma parcela em 28% da renda é aceita, mas merece atenção.
 */
export const ATTENTION_RATIO = 0.25;
export const REFERENCE_LIMIT_RATIO = 0.3;

export type CommitmentLevel = 'ok' | 'attention' | 'exceeded';

export interface IncomeCommitment {
  /** Fração da renda comprometida: 0.25 = 25%. */
  readonly ratio: number;
  readonly level: CommitmentLevel;
}

/**
 * Quanto da renda mensal a primeira parcela compromete.
 *
 * Usa a **primeira** parcela, com encargos, igual à regra da API. No SAC é a maior do
 * contrato; no Price as parcelas são iguais. Sem renda informada, não há avaliação.
 */
export function incomeCommitment(
  firstInstallmentCents: number,
  monthlyIncomeCents: number | undefined,
): IncomeCommitment | null {
  if (monthlyIncomeCents === undefined || monthlyIncomeCents <= 0) return null;

  const ratio = firstInstallmentCents / monthlyIncomeCents;
  const level: CommitmentLevel =
    ratio > REFERENCE_LIMIT_RATIO
      ? 'exceeded'
      : ratio >= ATTENTION_RATIO
        ? 'attention'
        : 'ok';

  return { ratio, level };
}
