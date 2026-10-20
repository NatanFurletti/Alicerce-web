'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { TextField } from '@/components/text-field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { getErrorMessage } from '@/lib/api/errors';

import { useLogin } from '../hooks/use-auth-mutations';
import { type LoginFormValues, loginSchema } from '../schemas/auth-schemas';
import { useRedirectWhenAuthenticated } from '../hooks/use-redirect-when-authenticated';

export function LoginForm() {
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get('expirou') === '1';
  const destination = useRedirectWhenAuthenticated();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit((values) => loginMutation.mutate(values));

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {sessionExpired && !loginMutation.isError && (
        <Alert>
          <AlertDescription>
            Sua sessão expirou. Entre novamente para continuar.
          </AlertDescription>
        </Alert>
      )}

      {loginMutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>{getErrorMessage(loginMutation.error)}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
      </FieldGroup>

      <Button type="submit" size="lg" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Entrando…' : 'Entrar'}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Ainda não tem conta?{' '}
        <Link
          href={`/cadastrar?redirect=${encodeURIComponent(destination)}`}
          className="text-foreground font-medium underline underline-offset-4"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}
