import { describe, expect, it } from 'vitest';

import { unwrap } from './client';
import { ApiError, getErrorMessage, isClientError, NETWORK_ERROR } from './errors';

function response(status: number): Response {
  return new Response(null, { status });
}

describe('ApiError.fromResponse', () => {
  it('usa o code da API e escolhe a mensagem por ele, guardando a original', () => {
    const error = ApiError.fromResponse(422, {
      statusCode: 422,
      code: 'LTV_EXCEEDED',
      message: 'LTV de 98.00% excede o máximo de 80%.',
    });

    expect(error.status).toBe(422);
    expect(error.code).toBe('LTV_EXCEEDED');
    expect(error.message).toMatch(/Aumente a entrada/);
    expect(error.apiMessage).toBe('LTV de 98.00% excede o máximo de 80%.');
  });

  it('code desconhecido cai numa mensagem genérica, sem expor o texto da API', () => {
    const error = ApiError.fromResponse(422, { code: 'CODIGO_NOVO', message: 'detalhe' });

    expect(error.code).toBe('CODIGO_NOVO');
    expect(error.message).toBe('Algo deu errado. Tente novamente.');
  });

  it('corpo fora do envelope vira INTERNAL_ERROR em 5xx e HTTP_ERROR em 4xx', () => {
    expect(ApiError.fromResponse(502, '<html>Bad Gateway</html>').code).toBe(
      'INTERNAL_ERROR',
    );
    expect(ApiError.fromResponse(404, undefined).code).toBe('HTTP_ERROR');
  });
});

describe('unwrap', () => {
  it('devolve os dados de uma resposta de sucesso', async () => {
    const data = await unwrap(
      Promise.resolve({ data: { ok: true }, response: response(200) }),
    );

    expect(data).toEqual({ ok: true });
  });

  it('lança ApiError quando a API responde com erro', async () => {
    const request = Promise.resolve({
      error: { code: 'INVALID_CREDENTIALS', message: 'E-mail ou senha inválidos.' },
      response: response(401),
    });

    await expect(unwrap(request)).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('falha de rede vira NETWORK_ERROR com status 0', async () => {
    const request = Promise.reject(new TypeError('Failed to fetch'));

    const error = await unwrap(request).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 0, code: NETWORK_ERROR });
    expect(getErrorMessage(error)).toMatch(/até um minuto/);
  });
});

describe('isClientError', () => {
  it('é verdadeiro só para 4xx', () => {
    expect(isClientError(ApiError.fromResponse(422, undefined))).toBe(true);
    expect(isClientError(ApiError.fromResponse(500, undefined))).toBe(false);
    expect(isClientError(ApiError.network(null))).toBe(false);
    expect(isClientError(new Error('qualquer'))).toBe(false);
  });
});
