'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import { TextField } from '@/components/text-field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { ApiError, getErrorMessage } from '@/lib/api/errors';

import { useRegister } from '../hooks/use-auth-mutations';
import {
  MIN_PASSWORD_LENGTH,
  type RegisterFormValues,
  registerSchema,
} from '../schemas/auth-schemas';
import { useRedirectWhenAuthenticated } from '../hooks/use-redirect-when-authenticated';

export function RegisterForm() {
  const destination = useRedirectWhenAuthenticated();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit((values) =>
    registerMutation.mutate(values, {
      onError: (error) => {
        // E-mail repetido é um problema de um campo específico: o erro vai para ele,
        // não para o alerta geral.
        if (error instanceof ApiError && error.code === 'EMAIL_ALREADY_IN_USE') {
          setError('email', { message: error.message }, { shouldFocus: true });
        }
      },
    }),
  );

  const emailTaken =
    registerMutation.error instanceof ApiError &&
    registerMutation.error.code === 'EMAIL_ALREADY_IN_USE';

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {registerMutation.isError && !emailTaken && (
        <Alert variant="destructive">
          <AlertDescription>{getErrorMessage(registerMutation.error)}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <TextField
          id="name"
          label="Nome"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <TextField
          id="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          id="password"
          label="Senha"
          type="password"
          autoComplete="new-password"
          description={`Pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`}
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          id="confirmPassword"
          label="Confirme a senha"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </FieldGroup>

      <Button type="submit" size="lg" disabled={registerMutation.isPending}>
        {registerMutation.isPending ? 'Criando conta…' : 'Criar conta'}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Já tem conta?{' '}
        <Link
          href={`/entrar?redirect=${encodeURIComponent(destination)}`}
          className="text-foreground font-medium underline underline-offset-4"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
