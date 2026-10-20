'use client';

import { type ReactNode, useEffect } from 'react';

import { installAuthMiddleware, restoreSession } from '../session/session-lifecycle';

// No carregamento do módulo, e não num efeito: os efeitos dos filhos rodam antes dos
// do pai, então uma requisição disparada por um filho sairia sem o middleware.
installAuthMiddleware();

/** Restaura a sessão ao abrir o site. Não renderiza nada além dos filhos. */
export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void restoreSession();
  }, []);

  return children;
}
