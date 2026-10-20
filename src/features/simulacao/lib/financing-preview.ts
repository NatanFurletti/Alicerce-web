import { parseDecimalBR } from '@/lib/parse-decimal';

/**
 * LTV de **referência** de mercado (80%), só para o aviso na tela. O limite que vale é
 * o da API, configurável por variável de ambiente. Se ele for outro, a API responde
 * 422 e o erro aparece no campo da entrada.
 */
export const REFERENCE_MAX_LTV = 0.8;

export interface FinancingPreview {
  readonly propertyValue: number;
  readonly totalDownPayment: number;
  readonly financedAmount: number;
  /** Fração do imóvel financiada: 0.8 = 80%. */
  readonly ltv: number;
  readonly exceedsReferenceLtv: boolean;
}

/** Valor digitado, ou 0 se estiver em branco ou inválido. A prévia não valida. */
function amountOrZero(value: string): number {
  const parsed = parseDecimalBR(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

/**
 * Prévia do financiamento enquanto o usuário digita.
 *
 * Lê o texto cru do formulário, válido ou não: a ideia é reagir a cada tecla, e a
 * validação de verdade acontece ao avançar de etapa. Sem um valor de imóvel válido não
 * há o que mostrar.
 */
export function financingPreview(input: {
  propertyValue: string;
  downPayment: string;
  fgts: string;
}): FinancingPreview | null {
  const propertyValue = parseDecimalBR(input.propertyValue);
  if (!Number.isFinite(propertyValue) || propertyValue <= 0) return null;

  const totalDownPayment = amountOrZero(input.downPayment) + amountOrZero(input.fgts);
  const financedAmount = Math.max(propertyValue - totalDownPayment, 0);
  const ltv = financedAmount / propertyValue;

  return {
    propertyValue,
    totalDownPayment,
    financedAmount,
    ltv,
    exceedsReferenceLtv: ltv > REFERENCE_MAX_LTV,
  };
}
