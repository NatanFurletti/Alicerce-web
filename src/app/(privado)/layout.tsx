import { type ReactNode, Suspense } from 'react';

import { PageSkeleton } from '@/components/page-skeleton';
import { RequireAuth } from '@/features/auth/components/require-auth';

/** Todas as rotas deste grupo exigem sessão. */
export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <RequireAuth>{children}</RequireAuth>
    </Suspense>
  );
}
