import type { components } from '@/lib/api/schema';
import { percentToRate, toCents } from '@/lib/money';

import type { SimulationFormValues } from '../schemas/simulation-form';

export type CreateSimulationBody = components['schemas']['CreateSimulationDto'];

/**
 * Formulário (reais e percentuais) → corpo de `POST /simulations` (centavos e decimais).
 *
 * É o único ponto de conversão entre as unidades da tela e as da API. Concentrar aqui
 * evita o erro clássico de mandar R$ 500.000 como `500000` centavos, ou 9,75% como
 * `9.75` em vez de `0.0975`.
 */
export function toCreateSimulationBody(
  values: SimulationFormValues,
): CreateSimulationBody {
  return {
    propertyValueCents: toCents(values.propertyValue),
    // Converte antes de somar: em reais, 19.99 + 0.01 já sai com erro de ponto flutuante.
    downPaymentCents: toCents(values.downPayment) + toCents(values.fgts),
    termMonths: values.termMonths,
    annualRate: percentToRate(values.annualRate),
    rateConvention: values.rateConvention,
    amortizationSystem: values.amortizationSystem,
    ...(values.monthlyIncome !== undefined && {
      monthlyIncomeCents: toCents(values.monthlyIncome),
    }),
    charges: {
      mipMonthlyRate: percentToRate(values.mipRate),
      dfiMonthlyRate: percentToRate(values.dfiRate),
      adminFeeCents: toCents(values.adminFee),
    },
  };
}
