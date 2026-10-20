'use client';

import { useSyncExternalStore } from 'react';

import { type SessionState, sessionStore } from '../session/session-store';

/**
 * Estado da sessão para os componentes.
 *
 * No servidor, e na primeira renderização do navegador, o estado é `loading`: o
 * servidor não tem como saber se há sessão, porque o token só existe no navegador.
 * Assim as duas renderizações batem e não há erro de hidratação.
 */
export function useSession(): SessionState {
  return useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getState,
    sessionStore.getServerState,
  );
}
