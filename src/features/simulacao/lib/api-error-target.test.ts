import { describe, expect, it } from 'vitest';

import { STEP_FIELDS } from '../schemas/simulation-form';
import { apiErrorTarget } from './api-error-target';

describe('apiErrorTarget', () => {
  it.each([
    ['LTV_EXCEEDED', 'downPayment'],
    ['DOWN_PAYMENT_EXCEEDS_PROPERTY_VALUE', 'downPayment'],
    ['INCOME_COMMITMENT_EXCEEDED', 'monthlyIncome'],
    ['TERM_EXCEEDS_MAXIMUM', 'termMonths'],
  ] as const)('%s volta para o campo %s', (code, field) => {
    expect(apiErrorTarget(code)?.field).toBe(field);
  });

  it('aponta a etapa do wizard em que o campo está', () => {
    // LTV é corrigido na entrada (etapa 2, índice 1); renda, na etapa 3.
    expect(apiErrorTarget('LTV_EXCEEDED')?.step).toBe(1);
    expect(apiErrorTarget('INCOME_COMMITMENT_EXCEEDED')?.step).toBe(2);
    expect(apiErrorTarget('TERM_EXCEEDS_MAXIMUM')?.step).toBe(3);
  });

  it('a etapa apontada sempre contém o campo', () => {
    for (const code of [
      'LTV_EXCEEDED',
      'DOWN_PAYMENT_EXCEEDS_PROPERTY_VALUE',
      'INCOME_COMMITMENT_EXCEEDED',
      'TERM_EXCEEDS_MAXIMUM',
    ]) {
      const target = apiErrorTarget(code);
      expect(STEP_FIELDS[target!.step]?.fields).toContain(target!.field);
    }
  });

  it('erros que não são de um campo ficam para o alerta geral', () => {
    for (const code of ['INTERNAL_ERROR', 'NETWORK_ERROR', 'RATE_LIMIT_EXCEEDED', 'X']) {
      expect(apiErrorTarget(code)).toBeNull();
    }
  });
});
