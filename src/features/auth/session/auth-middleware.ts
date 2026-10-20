import type { Middleware } from 'openapi-fetch';

interface AuthMiddlewareDeps {
  /** Access token atual, ou `null` se não houver sessão. */
  getAccessToken: () => string | null;
  /**
   * Renova a sessão e devolve o novo access token, ou `null` se não foi possível.
   * Precisa ser *single flight*: várias requisições com 401 simultâneo esperam a
   * mesma renovação.
   */
  refresh: () => Promise<string | null>;
  /** Usado para repetir a requisição. Injetável para teste. */
  fetch?: typeof globalThis.fetch;
}

/**
 * Rotas de autenticação: públicas, nunca levam token e nunca disparam renovação.
 * Um 401 no login é "senha errada", não "token expirado"; renovar ali não faria
 * sentido e, no caso de `/auth/refresh`, entraria em recursão.
 */
function isAuthRoute(schemaPath: string): boolean {
  return schemaPath.startsWith('/auth/');
}

function withToken(request: Request, token: string): Request {
  request.headers.set('Authorization', `Bearer ${token}`);
  return request;
}

/**
 * Middleware do `openapi-fetch` que injeta o access token e, num 401, renova a sessão
 * e repete a requisição uma vez.
 *
 * As dependências chegam por parâmetro, e não por import, para o middleware ser
 * testável sem rede e sem o cliente real.
 */
export function createAuthMiddleware(deps: AuthMiddlewareDeps): Middleware {
  const fetchImpl = deps.fetch ?? ((input, init) => globalThis.fetch(input, init));

  // Cópia de cada requisição em andamento, indexada pelo id do openapi-fetch. O corpo
  // de um `Request` só pode ser lido uma vez; sem a cópia, um POST que tomou 401 não
  // poderia ser repetido.
  const pending = new Map<string, Request>();

  return {
    onRequest({ request, schemaPath, id }) {
      if (isAuthRoute(schemaPath)) return undefined;

      const token = deps.getAccessToken();
      if (token !== null) withToken(request, token);

      pending.set(id, request.clone());
      return request;
    },

    async onResponse({ response, id }) {
      const original = pending.get(id);
      pending.delete(id);

      if (response.status !== 401 || original === undefined) return undefined;

      const token = await deps.refresh();
      // Sem token novo, devolve o 401 original: quem chamou trata como erro, e a
      // sessão já foi encerrada por quem implementa `refresh`.
      if (token === null) return undefined;

      // Repete UMA vez. Se der 401 de novo, o erro segue para quem chamou, em vez de
      // entrar num laço de renovações.
      return fetchImpl(withToken(original, token));
    },

    onError({ id }) {
      pending.delete(id);
    },
  };
}
