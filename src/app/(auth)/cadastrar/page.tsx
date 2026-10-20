import type { Metadata } from 'next';
import { Suspense } from 'react';

import { RegisterForm } from '@/features/auth/components/register-form';

import { AuthCard } from '../auth-card';
import { FormSkeleton } from '../form-skeleton';

export const metadata: Metadata = { title: 'Criar conta' };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Criar conta"
      description="Com uma conta, suas simulações ficam salvas para consultar depois."
    >
      <Suspense fallback={<FormSkeleton fields={4} />}>
        <RegisterForm />
      </Suspense>
    </AuthCard>
  );
}
