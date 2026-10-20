import { describe, expect, it } from 'vitest';

import type { SimulationFormValues } from '../schemas/simulation-form';
import { toCreateSimulationBody } from './to-request';

const values: SimulationFormValues = {
  propertyValue: 500_000,
  downPayment: 80_000,
  fgts: 20_000,
  monthlyIncome: 20_000,
  termMonths: 360,
  annualRate: 9.75,
  rateConvention: 'EFFECTIVE',
  amortizationSystem: 'SAC',
  mipRate: 0.025,
  dfiRate: 0.005,
  adminFee: 25,
};

describe('toCreateSimulationBody', () => {
  it('converte reais em centavos e percentuais em decimal, no formato da API', () => {
    expect(toCreateSimulationBody(values)).toEqual({
      propertyValueCents: 50_000_000,
      downPaymentCents: 10_000_000,
      termMonths: 360,
      annualRate: 0.0975,
      rateConvention: 'EFFECTIVE',
      amortizationSystem: 'SAC',
      monthlyIncomeCents: 2_000_000,
      charges: { mipMonthlyRate: 0.00025, dfiMonthlyRate: 0.00005, adminFeeCents: 2500 },
    });
  });

  it('soma entrada e FGTS em centavos, sem erro de ponto flutuante', () => {
    // Em reais, 19.99 + 0.01 = 19.999999999999996. Somar depois de converter evita
    // depender do arredondamento para acertar.
    const body = toCreateSimulationBody({ ...values, downPayment: 19.99, fgts: 0.01 });

    expect(body.downPaymentCents).toBe(2000);
  });

  it('omite a renda quando ela não foi informada', () => {
    // A API recusa campos que não conhece, mas aceita a ausência deste: sem renda,
    // ela simplesmente não checa o comprometimento.
    const body = toCreateSimulationBody({ ...values, monthlyIncome: undefined });

    expect(body).not.toHaveProperty('monthlyIncomeCents');
  });

  it('gera taxas com no máximo 10 casas decimais, o limite da API', () => {
    const body = toCreateSimulationBody({ ...values, annualRate: 9.7, mipRate: 0.07 });

    expect(body.annualRate).toBe(0.097);
    expect(body.charges.mipMonthlyRate).toBe(0.0007);
  });
});
