'use client';

import Link from 'next/link';

import { Button, buttonVariants } from '@/components/ui/button';
import { useLogout } from '@/features/auth/hooks/use-auth-mutations';
import { useSession } from '@/features/auth/hooks/use-session';

export function SiteHeader() {
  const session = useSession();
  const logout = useLogout();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4">
        <Link href="/" className="mr-auto text-lg font-semibold tracking-tight">
          Alicerce
        </Link>

        {session.status === 'authenticated' && (
          <>
            <nav aria-label="Principal" className="flex items-center gap-1">
              <Link
                href="/simular"
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              >
                Simular
              </Link>
              <Link
                href="/simulacoes"
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              >
                Histórico
              </Link>
            </nav>
            <span className="text-muted-foreground hidden text-sm sm:inline">
              {session.user.name}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              Sair
            </Button>
          </>
        )}

        {session.status === 'anonymous' && (
          <>
            <Link
              href="/entrar"
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              Entrar
            </Link>
            <Link href="/cadastrar" className={buttonVariants({ size: 'sm' })}>
              Criar conta
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
