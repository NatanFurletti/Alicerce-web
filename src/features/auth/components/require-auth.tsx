'use client';

import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

import { PageSkeleton } from '@/components/page-skeleton';

import { useSession } from '../hooks/use-session';

/**
 * Libera as telas privadas só para quem tem sessão.
 *
 * Isto é experiência de uso, **não segurança**: quem protege os dados é a API, que
 * recusa qualquer requisição sem token válido. Aqui o objetivo é não exibir uma tela
 * que só falharia, e levar o usuário ao login com a volta já preparada.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (session.status !== 'anonymous') return;

    const params = new URLSearchParams({ redirect: pathname });
    if (session.expired) params.set('expirou', '1');
    router.replace(`/entrar?${params.toString()}`);
  }, [session, pathname, router]);

  if (session.status !== 'authenticated') return <PageSkeleton />;
  return children;
}
