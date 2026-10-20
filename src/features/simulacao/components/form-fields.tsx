'use client';

import type { ReactNode } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { TextField } from '@/components/text-field';
import { formatCurrency, formatTerm } from '@/lib/format';
import { toCents } from '@/lib/money';
import { parseDecimalBR } from '@/lib/parse-decimal';

import type { SimulationFormInput } from '../schemas/simulation-form';

type Field = keyof SimulationFormInput;

interface NumberFieldProps {
  readonly name: Field;
  readonly label: string;
  readonly placeholder?: string;
  /** Texto fixo de ajuda, mostrado quando não há interpretação a exibir. */
  readonly hint?: ReactNode;
  /** Como mostrar o número interpretado, para o usuário conferir. */
  readonly describe?: (value: number) => string;
}

/**
 * Campo numérico do simulador, ligado ao formulário pelo contexto.
 *
 * Mostra como o texto digitado foi entendido ("Entendido como R$ 500.000,00"). O
 * formato pt-BR tem ambiguidades ("1.500" é mil e quinhentos ou um e meio?), e ver a
 * interpretação antes de enviar é mais honesto que adivinhar em silêncio.
 */
function NumberField({ name, label, placeholder, hint, describe }: NumberFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<SimulationFormInput>();
  const raw = useWatch<SimulationFormInput>({ name });
  const parsed = typeof raw === 'string' && raw.trim() !== '' ? parseDecimalBR(raw) : NaN;
  const interpretation =
    describe && Number.isFinite(parsed)
      ? `Entendido como ${describe(parsed)}.`
      : undefined;

  return (
    <TextField
      id={name}
      label={label}
      inputMode="decimal"
      autoComplete="off"
      placeholder={placeholder}
      description={interpretation ?? hint}
      error={errors[name]?.message}
      {...register(name)}
    />
  );
}

export function MoneyField(props: Omit<NumberFieldProps, 'describe'>) {
  return (
    <NumberField
      placeholder="0,00"
      {...props}
      describe={(value) => formatCurrency(toCents(value))}
    />
  );
}

export function PercentField(props: Omit<NumberFieldProps, 'describe'>) {
  return <NumberField placeholder="0,00" {...props} />;
}

export function TermField(props: Omit<NumberFieldProps, 'describe'>) {
  return (
    <NumberField
      {...props}
      describe={(value) =>
        Number.isInteger(value) && value > 0 ? formatTerm(value) : ''
      }
    />
  );
}

interface ChoiceFieldProps {
  readonly name: 'rateConvention' | 'amortizationSystem';
  readonly legend: string;
  readonly options: readonly { value: string; label: string; description: string }[];
}

/**
 * Escolha única com inputs de rádio nativos, num `fieldset` com `legend`.
 *
 * Nativo de propósito: navegação por setas, foco e anúncio do grupo no leitor de tela
 * vêm do navegador, sem precisar reimplementar nada.
 */
export function ChoiceField({ name, legend, options }: ChoiceFieldProps) {
  const { register } = useFormContext<SimulationFormInput>();

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-ring/50 flex cursor-pointer gap-3 rounded-lg border p-3 has-focus-visible:ring-3"
          >
            <input
              type="radio"
              value={option.value}
              className="accent-primary mt-1"
              {...register(name)}
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{option.label}</span>
              <span className="text-muted-foreground text-xs">{option.description}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
