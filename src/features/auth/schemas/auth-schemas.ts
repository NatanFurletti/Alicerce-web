import { z } from 'zod';

/**
 * Validação dos formulários de autenticação.
 *
 * Os limites espelham os DTOs da API (`RegisterDto`, `LoginDto`): o usuário vê o erro
 * no campo, antes de enviar. A API continua sendo a fonte da verdade e valida de novo.
 */

/** Mínimo da API (recomendação da OWASP, ver `auth.dto.ts` do alicerce-api). */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Máximo da API, em **bytes**, e não em caracteres: é o limite do bcrypt. Uma letra
 * acentuada ocupa 2 bytes em UTF-8 e um emoji, 4. Contar caracteres deixaria passar
 * uma senha que a API recusaria.
 */
export const MAX_PASSWORD_BYTES = 72;

const utf8 = new TextEncoder();

function byteLength(value: string): number {
  return utf8.encode(value).length;
}

const email = z
  .string()
  .trim()
  .min(1, 'Informe seu e-mail.')
  .max(320, 'Use no máximo 320 caracteres.')
  .pipe(z.email('Informe um e-mail válido.'));

/**
 * Login sem regra de tamanho de senha, igual à API: lá, o `LoginDto` não valida formato
 * de propósito, para não diferenciar "senha curta" de "senha errada" (ADR-022).
 */
export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Informe sua senha.'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Informe seu nome.')
      .max(200, 'Use no máximo 200 caracteres.'),
    email,
    password: z
      .string()
      .min(
        MIN_PASSWORD_LENGTH,
        `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      )
      .refine((value) => byteLength(value) <= MAX_PASSWORD_BYTES, {
        error:
          'Senha longa demais. O limite é de 72 bytes, e letras acentuadas ou ' +
          'emojis ocupam mais de um.',
      }),
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'As senhas não conferem.',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
