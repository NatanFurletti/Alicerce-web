'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { getSafeRedirect } from '@/lib/safe-redirect';

import { useSession } from './use-session';

/** Para onde vai quem entra sem um destino definido. */
export const DEFAULT_AFTER_LOGIN = '/simular';

/**
 * Nas telas de login e cadastro, leva o usuário adiante assim que houver sessão:
 * logo depois de entrar, ou ao abrir `/entrar` já estando logado.
 *
 * O destino vem de `?redirect=` (a página que pediu login) e passa por
 * `getSafeRedirect`, que recusa endereços externos.
 */
export function useRedirectWhenAuthenticated(): string {
  const session = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = getSafeRedirect(searchParams.get('redirect'), DEFAULT_AFTER_LOGIN);

  useEffect(() => {
    if (session.status === 'authenticated') router.replace(destination);
  }, [session.status, destination, router]);

  return destination;
}
