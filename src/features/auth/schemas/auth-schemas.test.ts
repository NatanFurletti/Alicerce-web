import { describe, expect, it } from 'vitest';

import { loginSchema, registerSchema } from './auth-schemas';

function errorsOf(result: { success: boolean; error?: { issues: unknown[] } }) {
  if (result.success || result.error === undefined) return {};
  return Object.fromEntries(
    (result.error.issues as { path: PropertyKey[]; message: string }[]).map((issue) => [
      issue.path.join('.'),
      issue.message,
    ]),
  );
}

const validRegister = {
  name: 'Natan Furletti',
  email: 'natan@example.com',
  password: 'senha-valida-123',
  confirmPassword: 'senha-valida-123',
};

describe('loginSchema', () => {
  it('aceita e-mail e senha preenchidos, aparando espaços do e-mail', () => {
    const result = loginSchema.safeParse({
      email: '  natan@example.com ',
      password: 'x',
    });

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe('natan@example.com');
  });

  it('exige os dois campos', () => {
    const result = loginSchema.safeParse({ email: '', password: '' });

    expect(errorsOf(result)).toEqual({
      email: 'Informe seu e-mail.',
      password: 'Informe sua senha.',
    });
  });

  it('recusa e-mail malformado', () => {
    const result = loginSchema.safeParse({ email: 'natan@', password: 'x' });

    expect(errorsOf(result).email).toBe('Informe um e-mail válido.');
  });

  it('não impõe tamanho mínimo de senha no login, igual à API', () => {
    // Exigir 8 caracteres aqui diferenciaria "senha curta" de "senha errada".
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '123' }).success).toBe(
      true,
    );
  });
});

describe('registerSchema', () => {
  it('aceita um cadastro válido e apara o nome', () => {
    const result = registerSchema.safeParse({ ...validRegister, name: '  Natan  ' });

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('Natan');
  });

  it('nome só com espaços conta como vazio', () => {
    const result = registerSchema.safeParse({ ...validRegister, name: '   ' });

    expect(errorsOf(result).name).toBe('Informe seu nome.');
  });

  it('exige senha de pelo menos 8 caracteres', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      password: '1234567',
      confirmPassword: '1234567',
    });

    expect(errorsOf(result).password).toMatch(/pelo menos 8/);
  });

  it('limita a senha a 72 BYTES, não a 72 caracteres', () => {
    // 40 caracteres acentuados = 80 bytes em UTF-8: passaria numa contagem de
    // caracteres, mas o bcrypt da API truncaria.
    const accented = 'é'.repeat(40);
    expect(accented.length).toBeLessThan(72);

    const result = registerSchema.safeParse({
      ...validRegister,
      password: accented,
      confirmPassword: accented,
    });

    expect(errorsOf(result).password).toMatch(/72 bytes/);
  });

  it('aceita exatamente 72 bytes', () => {
    const limit = 'a'.repeat(72);

    expect(
      registerSchema.safeParse({
        ...validRegister,
        password: limit,
        confirmPassword: limit,
      }).success,
    ).toBe(true);
  });

  it('acusa a divergência na confirmação, no campo da confirmação', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      confirmPassword: 'outra-senha-123',
    });

    expect(errorsOf(result)).toEqual({ confirmPassword: 'As senhas não conferem.' });
  });
});
