import { describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/api/client';

import { compareSystems } from './simulation-service';

vi.mock('@/lib/api/client', () => ({
  api: { POST: vi.fn(async () => ({ data: {}, response: new Response('{}') })) },
  unwrap: async (request: Promise<{ data: unknown }>) => (await request).data,
}));

describe('compareSystems', () => {
  it('não envia a renda: um sistema acima do limite derrubaria a comparação inteira', async () => {
    await compareSystems({
      propertyValueCents: 50_000_000,
      downPaymentCents: 10_000_000,
      termMonths: 360,
      annualRate: 0.0975,
      rateConvention: 'EFFECTIVE',
      amortizationSystem: 'PRICE',
      monthlyIncomeCents: 1_500_000,
      charges: { mipMonthlyRate: 0.00025, dfiMonthlyRate: 0.00005, adminFeeCents: 2500 },
    });

    // O tipo genérico do openapi-fetch não se resolve num mock: declara-se o formato
    // da chamada que o teste inspeciona.
    const [path, options] = vi.mocked(api.POST).mock.calls[0] as unknown as [
      string,
      { body: Record<string, unknown> },
    ];
    expect(path).toBe('/simulations/compare');
    expect(options.body).not.toHaveProperty('monthlyIncomeCents');
    expect(options.body).toMatchObject({ propertyValueCents: 50_000_000 });
  });
});
