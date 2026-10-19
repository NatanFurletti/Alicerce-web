'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { isClientError } from '@/lib/api/errors';

const MAX_RETRIES = 2;

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Repetir só faz sentido em falha de rede ou do servidor. Um 404 ou um 422 vai
        // dar o mesmo resultado na segunda tentativa, só que mais tarde.
        retry: (failureCount, error) =>
          !isClientError(error) && failureCount < MAX_RETRIES,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Um cliente novo por requisição no servidor (para não vazar cache entre usuários) e
 * um único no navegador (para o cache sobreviver às navegações). É o padrão da
 * documentação do Next.js para TanStack Query.
 */
function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
