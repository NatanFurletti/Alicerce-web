import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api/errors';
import { renderWithProviders } from '@/test/render';

import { login, register } from '../services/auth-service';
import { sessionStore } from '../session/session-store';
import { RegisterForm } from './register-form';

const router = { replace: vi.fn(), push: vi.fn() };

vi.mock('next/navigation', () => ({
  useRouter: () => router,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('../services/auth-service', () => ({ login: vi.fn(), register: vi.fn() }));

beforeEach(() => {
  vi.mocked(login).mockReset();
  vi.mocked(register).mockReset();
  router.replace.mockReset();
  sessionStore.reset();
});

async function fillAndSubmit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Nome'), 'Natan');
  await user.type(screen.getByLabelText('E-mail'), 'natan@example.com');
  await user.type(screen.getByLabelText('Senha'), 'senha-valida-123');
  await user.type(screen.getByLabelText('Confirme a senha'), 'senha-valida-123');
  await user.click(screen.getByRole('button', { name: 'Criar conta' }));
}

describe('RegisterForm', () => {
  it('cadastra e já entra, sem pedir as credenciais de novo', async () => {
    vi.mocked(register).mockResolvedValue({
      id: 'u1',
      name: 'Natan',
      email: 'natan@example.com',
      createdAt: '2026-10-19T12:00:00Z',
    });
    vi.mocked(login).mockResolvedValue({
      accessToken: 'a',
      refreshToken: 'r',
      user: { id: 'u1', name: 'Natan', email: 'natan@example.com' },
    });
    renderWithProviders(<RegisterForm />);

    await fillAndSubmit();

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/simular'));
    // A confirmação de senha é só do formulário: não vai para a API.
    expect(register).toHaveBeenCalledWith({
      name: 'Natan',
      email: 'natan@example.com',
      password: 'senha-valida-123',
    });
    expect(login).toHaveBeenCalledWith({
      email: 'natan@example.com',
      password: 'senha-valida-123',
    });
  });

  it('e-mail já cadastrado vira erro no próprio campo, não no alerta geral', async () => {
    vi.mocked(register).mockRejectedValue(
      ApiError.fromResponse(409, { code: 'EMAIL_ALREADY_IN_USE', message: 'x' }),
    );
    renderWithProviders(<RegisterForm />);

    await fillAndSubmit();

    const email = screen.getByLabelText('E-mail');
    await waitFor(() =>
      expect(email).toHaveAccessibleDescription('Este e-mail já está cadastrado.'),
    );
    expect(email).toHaveFocus();
    expect(screen.queryByRole('alert', { name: /algo deu errado/i })).toBeNull();
    expect(login).not.toHaveBeenCalled();
  });
});
