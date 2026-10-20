'use client';

import { FieldGroup } from '@/components/ui/field';

import { ChoiceField, MoneyField, PercentField, TermField } from './form-fields';

export function PropertyStep() {
  return (
    <FieldGroup>
      <MoneyField name="propertyValue" label="Valor do imóvel (R$)" />
    </FieldGroup>
  );
}

export function DownPaymentStep() {
  return (
    <FieldGroup>
      <MoneyField
        name="downPayment"
        label="Entrada com recursos próprios (R$)"
        hint="Pode ser 0, se toda a entrada vier do FGTS."
      />
      <MoneyField
        name="fgts"
        label="FGTS (R$, opcional)"
        hint="O FGTS é somado à entrada no cálculo."
      />
    </FieldGroup>
  );
}

export function IncomeStep() {
  return (
    <FieldGroup>
      <MoneyField
        name="monthlyIncome"
        label="Renda bruta familiar mensal (R$, opcional)"
        hint="Sem renda, a simulação funciona igual, mas não avalia o comprometimento."
      />
    </FieldGroup>
  );
}

export function TermStep() {
  return (
    <FieldGroup>
      <TermField name="termMonths" label="Prazo (meses)" placeholder="360" />
      <PercentField
        name="annualRate"
        label="Taxa de juros (% ao ano)"
        placeholder="9,75"
        hint="A taxa nominal da proposta do banco, sem os seguros."
      />
      <ChoiceField
        name="amortizationSystem"
        legend="Sistema de amortização"
        options={[
          {
            value: 'SAC',
            label: 'SAC',
            description:
              'Parcelas decrescentes. Começa mais alta e cobra menos juros no total.',
          },
          {
            value: 'PRICE',
            label: 'Price',
            description: 'Parcelas fixas. Começa mais baixa e cobra mais juros no total.',
          },
        ]}
      />
      <ChoiceField
        name="rateConvention"
        legend="Como converter a taxa anual em mensal"
        options={[
          {
            value: 'EFFECTIVE',
            label: 'Taxa efetiva',
            description: 'Equivalente composta: (1 + taxa)^(1/12) − 1.',
          },
          {
            value: 'NOMINAL',
            label: 'Taxa nominal',
            description: 'Divide por 12. Resulta numa taxa mensal maior.',
          },
        ]}
      />
      <details className="rounded-lg border p-3">
        <summary className="cursor-pointer text-sm font-medium">
          Seguros e taxa de administração
        </summary>
        <p className="text-muted-foreground mt-2 text-xs">
          Valores de referência de mercado, não da sua proposta. Confira os números reais
          com o banco.
        </p>
        <FieldGroup className="mt-4">
          <PercentField
            name="mipRate"
            label="MIP (% ao mês sobre o saldo devedor)"
            hint="Seguro de morte e invalidez permanente."
          />
          <PercentField
            name="dfiRate"
            label="DFI (% ao mês sobre o valor do imóvel)"
            hint="Seguro de danos físicos ao imóvel."
          />
          <MoneyField name="adminFee" label="Taxa de administração mensal (R$)" />
        </FieldGroup>
      </details>
    </FieldGroup>
  );
}
