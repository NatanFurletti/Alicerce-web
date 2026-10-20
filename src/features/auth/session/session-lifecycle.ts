import { api } from '@/lib/api/client';
import { isClientError } from '@/lib/api/errors';
import { singleFlight } from '@/lib/single-flight';

import { fetchProfile, refreshTokens } from '../services/auth-service';
import { createAuthMiddleware } from './auth-middleware';
import { sessionStore } from './session-store';

/**
 * Renova a sessão e devolve o novo access token, ou `null`.
 *
 * *Single flight*: chamadas simultâneas esperam a mesma renovação (ver
 * `singleFlight`). A sessão só é encerrada quando a **API recusa** o refresh token
 * (4xx). Numa falha de rede o token pode continuar válido, e apagá-lo deslogaria o
 * usuário por causa de uma oscilação de conexão.
 */
export const refreshSession = singleFlight(async (): Promise<string | null> => {
  const refreshToken = sessionStore.getRefreshToken();
  if (refreshToken === null) {
    sessionStore.signOut({ expired: sessionStore.getState().status === 'authenticated' });
    return null;
  }

  try {
    const tokens = await refreshTokens(refreshToken);
    sessionStore.setTokens(tokens);
    return tokens.accessToken;
  } catch (error) {
    if (isClientError(error)) sessionStore.signOut({ expired: true });
    return null;
  }
});

/**
 * Restaura a sessão ao abrir o site ou depois de um F5.
 *
 * O access token vivia só em memória e se perdeu; o refresh token continua no
 * `localStorage`. Com ele, a API emite um access token novo, e `GET /me` devolve o
 * usuário para o cabeçalho.
 */
export async function restoreSession(): Promise<void> {
  if (sessionStore.getState().status !== 'loading') return;

  if (sessionStore.getRefreshToken() === null) {
    sessionStore.signOut({ expired: false });
    return;
  }

  const token = await refreshSession();
  if (token === null) {
    // `refreshSession` já encerra a sessão quando a API recusa o token. Aqui sobra
    // a falha de rede: sem como confirmar a sessão, o usuário entra de novo.
    if (sessionStore.getState().status === 'loading') {
      sessionStore.signOut({ expired: false });
    }
    return;
  }

  try {
    sessionStore.authenticate(await fetchProfile());
  } catch {
    sessionStore.signOut({ expired: false });
  }
}

let installed = false;

/**
 * Registra o middleware de autenticação no cliente HTTP, uma única vez.
 *
 * Só no navegador: no servidor não há token, e o Next reaproveita módulos entre
 * requisições. Registrar lá acumularia middlewares sem utilidade.
 */
export function installAuthMiddleware(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  api.use(
    createAuthMiddleware({
      getAccessToken: sessionStore.getAccessToken,
      refresh: refreshSession,
    }),
  );
}
