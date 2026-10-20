import type { ComponentProps, ReactNode } from 'react';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface TextFieldProps extends ComponentProps<typeof Input> {
  readonly id: string;
  readonly label: ReactNode;
  readonly description?: ReactNode;
  readonly error?: string;
}

/**
 * Campo de texto acessível: rótulo, dica e erro ligados ao input.
 *
 * `aria-describedby` aponta para a dica e para o erro, então o leitor de tela anuncia
 * os dois ao focar o campo; `aria-invalid` marca o estado de erro (e o estilo do
 * shadcn/ui reage a ele).
 */
export function TextField({
  id,
  label,
  description,
  error,
  ...inputProps
}: TextFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {description && (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </Field>
  );
}
