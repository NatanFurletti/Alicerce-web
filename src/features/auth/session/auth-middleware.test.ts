import createClient from 'openapi-fetch';
import { describe, expect, it, vi } from 'vitest';

import type { paths } from '@/lib/api/schema';
import { singleFlight } from '@/lib/single-flight';

import { createAuthMiddleware } from './auth-middleware';

const BASE = 'http://api.test';

function json(status: number, body: unknown = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Monta um cliente real do openapi-fetch com uma API falsa.
 *
 * A API falsa responde 401 para o token "expirado" e 200 para o "novo". Testar com o
 * cliente de verdade, e não chamando o middleware à mão, garante que a integração
 * com o openapi-fetch (ids, clone do corpo, resposta substituída) funciona.
 */
function setup(options: { refreshResult?: string | null } = {}) {
  let accessToken: string | null = 'expirado';

  const server = vi.fn(async (request: Request) => {
    const auth = request.headers.get('Authorization');
    if (request.url.endsWith('/auth/login'))
      return json(401, { code: 'INVALID_CREDENTIALS' });
    if (auth !== 'Bearer novo') return json(401, { code: 'UNAUTHORIZED' });
    const body = request.method === 'POST' ? await request.json() : null;
    return json(200, { ok: true, body });
  });

  const refresh = vi.fn(async () => {
    const result = options.refreshResult === undefined ? 'novo' : options.refreshResult;
    accessToken = result;
    return result;
  });

  const client = createClient<paths>({
    baseUrl: BASE,
    fetch: (input: Request) => server(input),
  });
  client.use(
    createAuthMiddleware({
      getAccessToken: () => accessToken,
      refresh: singleFlight(refresh),
      fetch: (input) => server(input as Request),
    }),
  );

  return { client, server, refresh };
}

describe('createAuthMiddleware', () => {
  it('envia o access token atual no header Authorization', async () => {
    const { client, server } = setup();

    await client.GET('/me');

    const firstRequest = server.mock.calls[0]?.[0];
    expect(firstRequest?.headers.get('Authorization')).toBe('Bearer expirado');
  });

  it('num 401, renova a sessão e repete a requisição com o token novo', async () => {
    const { client, refresh } = setup();

    const { data, response } = await client.GET('/me');

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(data).toMatchObject({ ok: true });
  });

  it('repete um POST com o corpo original intacto', async () => {
    const { client } = setup();
    const body = {
      propertyValueCents: 50_000_000,
      downPaymentCents: 10_000_000,
      termMonths: 360,
      annualRate: 0.0975,
      rateConvention: 'EFFECTIVE' as const,
      amortizationSystem: 'SAC' as const,
      charges: { mipMonthlyRate: 0.00025, dfiMonthlyRate: 0.00005, adminFeeCents: 2500 },
    };

    const { data } = await client.POST('/simulations', { body });

    expect(data).toMatchObject({ body });
  });

  it('várias requisições com 401 simultâneo disparam UMA única renovação', async () => {
    const { client, refresh } = setup();

    const responses = await Promise.all([
      client.GET('/me'),
      client.GET('/simulations'),
      client.GET('/simulations/{id}', { params: { path: { id: 'abc' } } }),
    ]);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(responses.map((r) => r.response.status)).toEqual([200, 200, 200]);
  });

  it('se a renovação falha, devolve o 401 original sem repetir', async () => {
    const { client, server } = setup({ refreshResult: null });

    const { response, error } = await client.GET('/me');

    expect(response.status).toBe(401);
    expect(error).toMatchObject({ code: 'UNAUTHORIZED' });
    expect(server).toHaveBeenCalledTimes(1);
  });

  it('rotas de autenticação não levam token e não disparam renovação', async () => {
    const { client, server, refresh } = setup();

    const { response } = await client.POST('/auth/login', {
      body: { email: 'a@a.com', password: 'errada' },
    });

    expect(response.status).toBe(401);
    expect(refresh).not.toHaveBeenCalled();
    expect(server.mock.calls[0]?.[0].headers.get('Authorization')).toBeNull();
  });
});
