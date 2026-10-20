import { z } from 'zod';

import { parseDecimalBR } from '@/lib/parse-decimal';

/**
 * Formulário do simulador.
 *
 * Os campos guardam **texto**, como o usuário digitou ("500.000,00", "9,75"), e o
 * schema converte para número. Valores em reais e taxas em percentual: a conversão
 * para centavos e decimal, que é o contrato da API, acontece depois, em
 * `toCreateSimulationBody`.
 *
 * Os limites espelham o `CreateSimulationDto` da API. Regras de negócio, como LTV
 * máximo, comprometimento de renda e prazo máximo do contrato, são configuráveis lá
 * e não são duplicadas aqui: a API responde 422, e o erro volta para o campo certo
 * (`apiErrorTarget`).
 */

/** Teto da API: R$ 1 bilhão (1e11 centavos). Guarda de sanidade, não regra de negócio. */
const MAX_MONEY_REAIS = 1_000_000_000;
/** Teto sintático da API (`@Max(600)`). O máximo contratual (420) vem da política. */
export const MAX_TERM_MONTHS = 600;

const INVALID_NUMBER = 'Digite um valor válido, como 500.000,00.';
const NEGATIVE = 'O valor não pode ser negativo.';
const ABOVE_MAX = 'O valor máximo aceito é R$ 1 bilhão.';
const PERCENT_RANGE = 'A taxa precisa ficar entre 0% e 100%.';

/** Texto obrigatório convertido em número. */
function requiredNumber(emptyMessage: string, invalidMessage = INVALID_NUMBER) {
  return z
    .string()
    .trim()
    .min(1, emptyMessage)
    .transform(parseDecimalBR)
    .pipe(z.number({ error: invalidMessage }));
}

function requiredMoney(emptyMessage: string, { positive }: { positive: boolean }) {
  return requiredNumber(emptyMessage).pipe(
    positive
      ? z
          .number()
          .positive('O valor precisa ser maior que zero.')
          .max(MAX_MONEY_REAIS, ABOVE_MAX)
      : z.number().min(0, NEGATIVE).max(MAX_MONEY_REAIS, ABOVE_MAX),
  );
}

function requiredPercent(emptyMessage: string, rangeMessage = PERCENT_RANGE) {
  return requiredNumber(emptyMessage).pipe(
    z.number().min(0, rangeMessage).max(100, rangeMessage),
  );
}

const MONEY_PAIR_FIELDS = ['propertyValue', 'downPayment', 'fgts'];

export const simulationFormSchema = z
  .object({
    propertyValue: requiredMoney('Informe o valor do imóvel.', { positive: true }),
    downPayment: requiredMoney('Informe o valor da entrada. Pode ser 0.', {
      positive: false,
    }),
    /** Opcional: vazio vale 0. É somado à entrada; a API não distingue as origens. */
    fgts: z
      .string()
      .trim()
      .transform((value) => (value === '' ? 0 : parseDecimalBR(value)))
      .pipe(
        z
          .number({ error: INVALID_NUMBER })
          .min(0, NEGATIVE)
          .max(MAX_MONEY_REAIS, ABOVE_MAX),
      ),
    /** Opcional: vazio significa "não informada", e a API não checa comprometimento. */
    monthlyIncome: z
      .string()
      .trim()
      .transform((value) => (value === '' ? undefined : parseDecimalBR(value)))
      .pipe(
        z
          .number({ error: INVALID_NUMBER })
          .positive('Informe uma renda maior que zero ou deixe o campo em branco.')
          .max(MAX_MONEY_REAIS, ABOVE_MAX)
          .optional(),
      ),
    termMonths: requiredNumber(
      'Informe o prazo.',
      'Digite o prazo em meses, como 360.',
    ).pipe(
      z
        .number()
        .int('O prazo precisa ser um número inteiro de meses.')
        .min(1, 'O prazo precisa ser de pelo menos 1 mês.')
        .max(MAX_TERM_MONTHS, `O prazo pode ser de no máximo ${MAX_TERM_MONTHS} meses.`),
    ),
    annualRate: requiredPercent('Informe a taxa de juros.'),
    rateConvention: z.enum(['EFFECTIVE', 'NOMINAL']),
    amortizationSystem: z.enum(['SAC', 'PRICE']),
    mipRate: requiredPercent('Informe a alíquota do MIP.'),
    dfiRate: requiredPercent('Informe a alíquota do DFI.'),
    adminFee: requiredMoney('Informe a taxa de administração. Pode ser 0.', {
      positive: false,
    }),
  })
  .refine((data) => data.downPayment + data.fgts < data.propertyValue, {
    error: 'A entrada, somada ao FGTS, precisa ser menor que o valor do imóvel.',
    path: ['downPayment'],
    // Só roda quando os três campos da regra são válidos. Com o imóvel em branco, a
    // comparação seria contra NaN e acusaria um erro falso na entrada. Campos de
    // outras etapas não interferem: no passo 2 a regra já vale.
    when: (payload) =>
      !payload.issues.some((issue) =>
        MONEY_PAIR_FIELDS.includes(String(issue.path?.[0])),
      ),
  });

export type SimulationFormInput = z.input<typeof simulationFormSchema>;
export type SimulationFormValues = z.output<typeof simulationFormSchema>;

/**
 * Valores iniciais. As alíquotas de seguro e a taxa de administração são os valores
 * de **referência** do alicerce-api (`.env.example`), não regulação vigente: variam
 * por banco e devem ser conferidas na proposta real.
 */
export const SIMULATION_FORM_DEFAULTS: SimulationFormInput = {
  propertyValue: '',
  downPayment: '',
  fgts: '',
  monthlyIncome: '',
  termMonths: '360',
  annualRate: '',
  rateConvention: 'EFFECTIVE',
  amortizationSystem: 'SAC',
  mipRate: '0,025',
  dfiRate: '0,005',
  adminFee: '25,00',
};

export interface WizardStep {
  readonly title: string;
  readonly description: string;
  readonly fields: readonly (keyof SimulationFormInput)[];
}

/** As etapas do wizard e os campos validados ao avançar de cada uma. */
export const STEP_FIELDS: readonly WizardStep[] = [
  {
    title: 'Imóvel',
    description: 'Quanto custa o imóvel que você quer financiar?',
    fields: ['propertyValue'],
  },
  {
    title: 'Entrada e FGTS',
    description: 'Quanto você vai dar de entrada, com recursos próprios e FGTS?',
    fields: ['downPayment', 'fgts'],
  },
  {
    title: 'Renda',
    description:
      'Com a renda, a simulação mostra quanto da sua renda a parcela compromete.',
    fields: ['monthlyIncome'],
  },
  {
    title: 'Prazo e sistema',
    description: 'Prazo, taxa de juros e sistema de amortização.',
    fields: [
      'termMonths',
      'annualRate',
      'rateConvention',
      'amortizationSystem',
      'mipRate',
      'dfiRate',
      'adminFee',
    ],
  },
];
