import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api/errors';

import { fetchProfile, refreshTokens } from '../services/auth-service';
import { restoreSession } from './session-lifecycle';
import { sessionStore } from './session-store';

vi.mock('../services/auth-service', () => ({
  refreshTokens: vi.fn(),
  fetchProfile: vi.fn(),
}));

const user = {
  id: 'u1',
  name: 'Natan',
  email: 'natan@example.com',
  createdAt: '2026-10-19T12:00:00Z',
};

beforeEach(() => {
  vi.mocked(refreshTokens).mockReset();
  vi.mocked(fetchProfile).mockReset();
  sessionStore.reset();
});

describe('restoreSession', () => {
  it('sem refresh token guardado, a sessão é anônima e a API nem é chamada', async () => {
    await restoreSession();

    expect(sessionStore.getState()).toEqual({ status: 'anonymous', expired: false });
    expect(refreshTokens).not.toHaveBeenCalled();
  });

  it('com refresh token válido, renova, busca o perfil e autentica', async () => {
    sessionStore.setTokens({ accessToken: 'velho', refreshToken: 'refresh-1' });
    vi.mocked(refreshTokens).mockResolvedValue({
      accessToken: 'novo',
      refreshToken: 'refresh-2',
    });
    vi.mocked(fetchProfile).mockResolvedValue(user);

    await restoreSession();

    expect(refreshTokens).toHaveBeenCalledWith('refresh-1');
    expect(sessionStore.getAccessToken()).toBe('novo');
    expect(sessionStore.getRefreshToken()).toBe('refresh-2');
    expect(sessionStore.getState()).toEqual({ status: 'authenticated', user });
  });

  it('refresh token recusado pela API: encerra a sessão como expirada', async () => {
    sessionStore.setTokens({ accessToken: 'velho', refreshToken: 'vencido' });
    vi.mocked(refreshTokens).mockRejectedValue(
      ApiError.fromResponse(401, { code: 'INVALID_TOKEN', message: 'expirado' }),
    );

    await restoreSession();

    expect(sessionStore.getState()).toEqual({ status: 'anonymous', expired: true });
    expect(sessionStore.getRefreshToken()).toBeNull();
  });

  it('falha de rede não apaga o refresh token durante a renovação', async () => {
    // Uma oscilação de conexão não pode deslogar quem tem um token válido.
    sessionStore.setTokens({ accessToken: 'velho', refreshToken: 'refresh-1' });
    sessionStore.authenticate(user);
    vi.mocked(refreshTokens).mockRejectedValue(
      ApiError.network(new TypeError('offline')),
    );

    const { refreshSession } = await import('./session-lifecycle');
    await expect(refreshSession()).resolves.toBeNull();

    expect(sessionStore.getRefreshToken()).toBe('refresh-1');
    expect(sessionStore.getState()).toMatchObject({ status: 'authenticated' });
  });

  it('não roda de novo se a sessão já foi resolvida', async () => {
    sessionStore.signOut({ expired: false });
    sessionStore.setTokens({ accessToken: 'a', refreshToken: 'r' });

    await restoreSession();

    expect(refreshTokens).not.toHaveBeenCalled();
  });
});
