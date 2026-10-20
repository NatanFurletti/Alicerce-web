import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api/errors';
import { renderWithProviders } from '@/test/render';

import { login } from '../services/auth-service';
import { sessionStore } from '../session/session-store';
import { LoginForm } from './login-form';

const router = { replace: vi.fn(), push: vi.fn() };
let searchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => router,
  useSearchParams: () => searchParams,
}));

vi.mock('../services/auth-service', () => ({ login: vi.fn() }));

const loginResult = {
  accessToken: 'access',
  refreshToken: 'refresh',
  user: { id: 'u1', name: 'Natan', email: 'natan@example.com' },
};

beforeEach(() => {
  vi.mocked(login).mockReset();
  router.replace.mockReset();
  searchParams = new URLSearchParams();
  sessionStore.reset();
});

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('E-mail'), email);
  await user.type(screen.getByLabelText('Senha'), password);
  await user.click(screen.getByRole('button', { name: 'Entrar' }));
}

describe('LoginForm', () => {
  it('valida antes de enviar e liga o erro ao campo', async () => {
    renderWithProviders(<LoginForm />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Entrar' }));

    const email = screen.getByLabelText('E-mail');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Informe seu e-mail.');
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('entra, abre a sessão e leva para o destino pedido', async () => {
    searchParams = new URLSearchParams({ redirect: '/simulacoes' });
    vi.mocked(login).mockResolvedValue(loginResult);
    renderWithProviders(<LoginForm />);

    await fillAndSubmit('natan@example.com', 'senha-valida-123');

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/simulacoes'));
    expect(vi.mocked(login).mock.calls[0]?.[0]).toEqual({
      email: 'natan@example.com',
      password: 'senha-valida-123',
    });
    expect(sessionStore.getState()).toMatchObject({ status: 'authenticated' });
  });

  it('ignora destino externo no ?redirect=', async () => {
    searchParams = new URLSearchParams({ redirect: 'https://site-falso.com' });
    vi.mocked(login).mockResolvedValue(loginResult);
    renderWithProviders(<LoginForm />);

    await fillAndSubmit('natan@example.com', 'senha-valida-123');

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/simular'));
  });

  it('mostra a mensagem amigável quando a API recusa as credenciais', async () => {
    vi.mocked(login).mockRejectedValue(
      ApiError.fromResponse(401, { code: 'INVALID_CREDENTIALS', message: 'x' }),
    );
    renderWithProviders(<LoginForm />);

    await fillAndSubmit('natan@example.com', 'errada');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'E-mail ou senha inválidos.',
    );
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('avisa quando chegou aqui porque a sessão expirou', () => {
    searchParams = new URLSearchParams({ expirou: '1' });
    renderWithProviders(<LoginForm />);

    expect(screen.getByRole('alert')).toHaveTextContent('Sua sessão expirou');
  });
});
