import { type SimulationFormInput, STEP_FIELDS } from '../schemas/simulation-form';

type FormField = keyof SimulationFormInput;

/**
 * Regras de negócio da API (422) e o campo do formulário que as corrige.
 *
 * A API valida LTV, comprometimento de renda e prazo máximo com limites configuráveis,
 * que o front não conhece. Quando ela recusa, o erro precisa aparecer **onde o usuário
 * consegue agir**: um LTV excedido se resolve aumentando a entrada, não no último
 * passo do wizard.
 */
const FIELD_BY_CODE: Readonly<Record<string, FormField>> = {
  LTV_EXCEEDED: 'downPayment',
  DOWN_PAYMENT_EXCEEDS_PROPERTY_VALUE: 'downPayment',
  INCOME_COMMITMENT_EXCEEDED: 'monthlyIncome',
  TERM_EXCEEDS_MAXIMUM: 'termMonths',
};

export interface ApiErrorTarget {
  /** Índice da etapa do wizard (0 = primeira). */
  readonly step: number;
  readonly field: FormField;
}

/** Para onde levar o usuário diante de um erro da API, ou `null` se não for de campo. */
export function apiErrorTarget(code: string): ApiErrorTarget | null {
  const field = FIELD_BY_CODE[code];
  if (field === undefined) return null;

  // A etapa vem de STEP_FIELDS, não de um número fixo: se os campos mudarem de etapa,
  // o destino acompanha.
  const step = STEP_FIELDS.findIndex((candidate) => candidate.fields.includes(field));
  return { step, field };
}
