import { describe, expect, it } from 'vitest';

import {
  type SimulationFormInput,
  simulationFormSchema,
  STEP_FIELDS,
  SIMULATION_FORM_DEFAULTS,
} from './simulation-form';

const valid: SimulationFormInput = {
  propertyValue: '500.000,00',
  downPayment: '80.000,00',
  fgts: '20.000,00',
  monthlyIncome: '20.000,00',
  termMonths: '360',
  annualRate: '9,75',
  rateConvention: 'EFFECTIVE',
  amortizationSystem: 'SAC',
  mipRate: '0,025',
  dfiRate: '0,005',
  adminFee: '25,00',
};

function errorsOf(input: SimulationFormInput): Record<string, string> {
  const result = simulationFormSchema.safeParse(input);
  if (result.success) return {};
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path.join('.'), issue.message]),
  );
}

describe('simulationFormSchema', () => {
  it('converte o texto digitado em números', () => {
    const result = simulationFormSchema.parse(valid);

    expect(result).toEqual({
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
    });
  });

  it('FGTS e renda são opcionais: vazio vira 0 e "não informada"', () => {
    const result = simulationFormSchema.parse({ ...valid, fgts: '', monthlyIncome: '' });

    expect(result.fgts).toBe(0);
    expect(result.monthlyIncome).toBeUndefined();
  });

  describe('valor do imóvel', () => {
    it('é obrigatório, positivo e numérico', () => {
      expect(errorsOf({ ...valid, propertyValue: '' }).propertyValue).toBe(
        'Informe o valor do imóvel.',
      );
      expect(errorsOf({ ...valid, propertyValue: '0' }).propertyValue).toBe(
        'O valor precisa ser maior que zero.',
      );
      expect(errorsOf({ ...valid, propertyValue: 'quinhentos' }).propertyValue).toBe(
        'Digite um valor válido, como 500.000,00.',
      );
    });

    it('respeita o teto de R$ 1 bilhão da API', () => {
      expect(
        errorsOf({ ...valid, propertyValue: '1.000.000.001,00' }).propertyValue,
      ).toMatch(/máximo/);
    });
  });

  describe('entrada', () => {
    it('aceita entrada zero', () => {
      // A entrada zero é sintaticamente válida; o LTV quem recusa é a API.
      expect(
        errorsOf({ ...valid, downPayment: '0', fgts: '' }).downPayment,
      ).toBeUndefined();
    });

    it('entrada somada ao FGTS precisa ser menor que o valor do imóvel', () => {
      expect(
        errorsOf({ ...valid, downPayment: '400.000,00', fgts: '100.000,00' }).downPayment,
      ).toBe('A entrada, somada ao FGTS, precisa ser menor que o valor do imóvel.');
    });

    it('a regra entre campos funciona com as etapas seguintes ainda vazias', () => {
      // No passo 2, prazo e taxa ainda estão em branco. O erro precisa aparecer ali,
      // perto do campo que o causou, e não só no fim do wizard.
      const atStepTwo = {
        ...SIMULATION_FORM_DEFAULTS,
        propertyValue: '500.000,00',
        downPayment: '600.000,00',
      };

      expect(errorsOf(atStepTwo).downPayment).toMatch(/menor que o valor do imóvel/);
    });

    it('não acusa a entrada quando o problema está no valor do imóvel', () => {
      // Com o imóvel em branco, comparar a entrada com ele seria comparar com NaN, e o
      // usuário veria um erro falso na entrada, além do erro real no imóvel.
      const errors = errorsOf({ ...valid, propertyValue: '', downPayment: '80.000,00' });

      expect(errors.propertyValue).toBe('Informe o valor do imóvel.');
      expect(errors.downPayment).toBeUndefined();
    });
  });

  describe('renda', () => {
    it('se informada, precisa ser maior que zero', () => {
      expect(errorsOf({ ...valid, monthlyIncome: '0' }).monthlyIncome).toBe(
        'Informe uma renda maior que zero ou deixe o campo em branco.',
      );
    });
  });

  describe('prazo', () => {
    it('é um número inteiro de meses, de 1 a 600', () => {
      expect(errorsOf({ ...valid, termMonths: '' }).termMonths).toBe('Informe o prazo.');
      expect(errorsOf({ ...valid, termMonths: '360,5' }).termMonths).toBe(
        'O prazo precisa ser um número inteiro de meses.',
      );
      expect(errorsOf({ ...valid, termMonths: '0' }).termMonths).toBe(
        'O prazo precisa ser de pelo menos 1 mês.',
      );
      expect(errorsOf({ ...valid, termMonths: '601' }).termMonths).toBe(
        'O prazo pode ser de no máximo 600 meses.',
      );
    });
  });

  describe('taxas', () => {
    it('a taxa de juros é obrigatória e fica entre 0% e 100%', () => {
      expect(errorsOf({ ...valid, annualRate: '' }).annualRate).toBe(
        'Informe a taxa de juros.',
      );
      expect(errorsOf({ ...valid, annualRate: '101' }).annualRate).toBe(
        'A taxa precisa ficar entre 0% e 100%.',
      );
      expect(errorsOf({ ...valid, annualRate: '0' }).annualRate).toBeUndefined();
    });

    it('as alíquotas de seguro ficam entre 0% e 100%', () => {
      expect(errorsOf({ ...valid, mipRate: '-1' }).mipRate).toMatch(/entre 0% e 100%/);
      expect(errorsOf({ ...valid, dfiRate: '200' }).dfiRate).toMatch(/entre 0% e 100%/);
    });

    it('a taxa de administração não pode ser negativa', () => {
      expect(errorsOf({ ...valid, adminFee: '-5' }).adminFee).toBe(
        'O valor não pode ser negativo.',
      );
    });
  });
});

describe('STEP_FIELDS', () => {
  it('cada campo do formulário pertence a exatamente uma etapa', () => {
    // Um campo fora de todas as etapas nunca seria validado ao avançar; um campo em
    // duas seria cobrado antes da hora.
    const all = STEP_FIELDS.flatMap((step) => step.fields);

    expect([...all].sort()).toEqual(Object.keys(valid).sort());
    expect(new Set(all).size).toBe(all.length);
  });
});
