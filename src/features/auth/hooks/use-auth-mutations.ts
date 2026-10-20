'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import {
  type LoginInput,
  type LoginResult,
  login,
  register,
} from '../services/auth-service';
import { sessionStore } from '../session/session-store';

function startSession({ accessToken, refreshToken, user }: LoginResult): void {
  sessionStore.signIn({ accessToken, refreshToken }, user);
}

export function useLogin() {
  return useMutation({ mutationFn: login, onSuccess: startSession });
}

interface RegisterVariables extends LoginInput {
  readonly name: string;
}

/**
 * Cadastro seguido de login.
 *
 * A API devolve só o usuário criado, sem tokens. Entrar logo em seguida, com as mesmas
 * credenciais, evita pedir ao usuário que digite tudo de novo.
 */
export function useRegister() {
  return useMutation({
    mutationFn: async ({ name, email, password }: RegisterVariables) => {
      await register({ name, email, password });
      return login({ email, password });
    },
    onSuccess: startSession,
  });
}

/**
 * Sai da conta. Não chama a API: os tokens são stateless e não há rota de logout.
 *
 * Limpar o cache do TanStack Query é parte do logout, e não detalhe. Sem isso, quem
 * entrasse em seguida no mesmo navegador veria por alguns instantes o histórico do
 * usuário anterior.
 */
export function useLogout(): () => void {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useCallback(() => {
    sessionStore.signOut({ expired: false });
    queryClient.clear();
    router.push('/');
  }, [queryClient, router]);
}
