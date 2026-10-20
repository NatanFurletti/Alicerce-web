import { beforeEach, describe, expect, it, vi } from 'vitest';

import { REFRESH_TOKEN_KEY, sessionStore } from './session-store';

const tokens = { accessToken: 'access-1', refreshToken: 'refresh-1' };
const user = { id: 'u1', name: 'Natan', email: 'natan@example.com' };

beforeEach(() => {
  sessionStore.reset();
});

describe('sessionStore', () => {
  it('começa em loading, que também é o estado do servidor', () => {
    expect(sessionStore.getState()).toEqual({ status: 'loading' });
    expect(sessionStore.getServerState()).toEqual({ status: 'loading' });
  });

  it('no login, guarda o access token só em memória e o refresh no localStorage', () => {
    sessionStore.signIn(tokens, user);

    expect(sessionStore.getAccessToken()).toBe('access-1');
    expect(window.localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-1');
    expect(JSON.stringify(window.localStorage)).not.toContain('access-1');
    expect(sessionStore.getState()).toEqual({ status: 'authenticated', user });
  });

  it('a renovação substitui os dois tokens, porque a API rotaciona o refresh', () => {
    sessionStore.signIn(tokens, user);

    sessionStore.setTokens({ accessToken: 'access-2', refreshToken: 'refresh-2' });

    expect(sessionStore.getAccessToken()).toBe('access-2');
    expect(sessionStore.getRefreshToken()).toBe('refresh-2');
  });

  it('ao sair, apaga os tokens e diferencia sessão expirada de saída voluntária', () => {
    sessionStore.signIn(tokens, user);
    sessionStore.signOut({ expired: true });

    expect(sessionStore.getAccessToken()).toBeNull();
    expect(sessionStore.getRefreshToken()).toBeNull();
    expect(sessionStore.getState()).toEqual({ status: 'anonymous', expired: true });

    sessionStore.signOut({ expired: false });
    expect(sessionStore.getState()).toEqual({ status: 'anonymous', expired: false });
  });

  it('avisa os inscritos a cada mudança e para de avisar depois de cancelar', () => {
    const listener = vi.fn();
    const unsubscribe = sessionStore.subscribe(listener);

    sessionStore.signIn(tokens, user);
    unsubscribe();
    sessionStore.signOut({ expired: false });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('devolve o mesmo objeto enquanto o estado não muda', () => {
    // useSyncExternalStore compara por referência; um objeto novo a cada leitura
    // faria o React renderizar em loop.
    sessionStore.signOut({ expired: false });

    expect(sessionStore.getState()).toBe(sessionStore.getState());
  });
});
