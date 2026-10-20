import { describe, expect, it } from 'vitest';

import { financingPreview } from './financing-preview';

describe('financingPreview', () => {
  it('calcula financiado e LTV a partir do que foi digitado', () => {
    expect(
      financingPreview({
        propertyValue: '500.000,00',
        downPayment: '80.000,00',
        fgts: '20.000,00',
      }),
    ).toEqual({
      propertyValue: 500_000,
      totalDownPayment: 100_000,
      financedAmount: 400_000,
      ltv: 0.8,
      exceedsReferenceLtv: false,
    });
  });

  it('sinaliza LTV acima da referência de 80%', () => {
    const preview = financingPreview({
      propertyValue: '500.000,00',
      downPayment: '50.000,00',
      fgts: '',
    });

    expect(preview?.ltv).toBe(0.9);
    expect(preview?.exceedsReferenceLtv).toBe(true);
  });

  it('entrada e FGTS em branco contam como zero enquanto o usuário digita', () => {
    const preview = financingPreview({
      propertyValue: '300.000',
      downPayment: '',
      fgts: '',
    });

    expect(preview?.financedAmount).toBe(300_000);
    expect(preview?.ltv).toBe(1);
  });

  it('sem um valor de imóvel válido, não há prévia', () => {
    for (const propertyValue of ['', '0', 'abc']) {
      expect(financingPreview({ propertyValue, downPayment: '10', fgts: '' })).toBeNull();
    }
  });

  it('entrada maior que o imóvel não gera financiado negativo', () => {
    const preview = financingPreview({
      propertyValue: '100.000',
      downPayment: '150.000',
      fgts: '',
    });

    expect(preview?.financedAmount).toBe(0);
    expect(preview?.ltv).toBe(0);
  });
});
