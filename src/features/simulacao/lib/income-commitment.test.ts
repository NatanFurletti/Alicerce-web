import { describe, expect, it } from 'vitest';

import { incomeCommitment } from './income-commitment';

describe('incomeCommitment', () => {
  it('calcula a fração da renda comprometida pela primeira parcela', () => {
    expect(incomeCommitment(437_432, 2_000_000)?.ratio).toBeCloseTo(0.2187, 4);
  });

  it('sem renda informada, não há o que avaliar', () => {
    expect(incomeCommitment(437_432, undefined)).toBeNull();
    expect(incomeCommitment(437_432, 0)).toBeNull();
  });

  it('abaixo de 25% está ok', () => {
    expect(incomeCommitment(2_000, 10_000)?.level).toBe('ok');
    expect(incomeCommitment(2_499, 10_000)?.level).toBe('ok');
  });

  it('de 25% a 30% pede atenção', () => {
    expect(incomeCommitment(2_500, 10_000)?.level).toBe('attention');
    expect(incomeCommitment(3_000, 10_000)?.level).toBe('attention');
  });

  it('acima de 30% ultrapassa o limite de referência', () => {
    expect(incomeCommitment(3_001, 10_000)?.level).toBe('exceeded');
    expect(incomeCommitment(5_000, 10_000)?.level).toBe('exceeded');
  });
});
