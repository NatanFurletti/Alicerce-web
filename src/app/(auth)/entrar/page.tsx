import type { Metadata } from 'next';
import { Suspense } from 'react';

import { LoginForm } from '@/features/auth/components/login-form';

import { AuthCard } from '../auth-card';
import { FormSkeleton } from '../form-skeleton';

export const metadata: Metadata = { title: 'Entrar' };

export default function LoginPage() {
  return (
    <AuthCard title="Entrar" description="Acesse suas simulações salvas.">
      {/* O formulário lê `?redirect=` e `?expirou=`, que só existem na requisição:
          o Suspense deixa o resto da página ser pré-renderizado. */}
      <Suspense fallback={<FormSkeleton fields={2} />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
