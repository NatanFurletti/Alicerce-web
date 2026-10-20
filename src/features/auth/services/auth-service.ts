import { api, unwrap } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

/**
 * Chamadas de autenticação à API.
 *
 * É a única parte da feature que conhece HTTP. Hooks e componentes chamam estas
 * funções e recebem dados ou um `ApiError`; nunca veem um `Response`.
 */

export type LoginInput = components['schemas']['LoginDto'];
export type RegisterInput = components['schemas']['RegisterDto'];
export type LoginResult = components['schemas']['LoginResponseDto'];
export type UserProfile = components['schemas']['UserResponseDto'];
export type TokenPairResult = components['schemas']['TokenPairResponseDto'];

export function login(input: LoginInput): Promise<LoginResult> {
  return unwrap(api.POST('/auth/login', { body: input }));
}

export function register(input: RegisterInput): Promise<UserProfile> {
  return unwrap(api.POST('/auth/register', { body: input }));
}

/** Troca o refresh token por um par novo. O antigo deve ser descartado. */
export function refreshTokens(refreshToken: string): Promise<TokenPairResult> {
  return unwrap(api.POST('/auth/refresh', { body: { refreshToken } }));
}

export function fetchProfile(): Promise<UserProfile> {
  return unwrap(api.GET('/me'));
}
