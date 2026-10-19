import createClient from 'openapi-fetch';

import { ApiError } from './errors';
import type { paths } from './schema';

/**
 * URL base da API. `NEXT_PUBLIC_` porque Ã© lida no navegador, e o Next a embute no
 * bundle durante o build: mudar a variÃ¡vel exige um novo build, nÃ£o sÃ³ reiniciar.
 */
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'
).replace(/\/+$/, '');

/**
 * Cliente HTTP tipado a partir do OpenAPI (`npm run generate:api`).
 *
 * Rotas, parÃ¢metros, corpos e respostas sÃ£o verificados pelo compilador: se a API
 * mudar o contrato e os tipos forem regenerados, o front deixa de compilar onde usava
 * o formato antigo.
 *
 * **SÃ³ a camada de serviÃ§o (`features/<feature>/services`) importa este mÃ³dulo.**
 * Componentes chamam hooks, que chamam serviÃ§os.
 */
export const api = createClient<paths>({ baseUrl: API_URL });

/** Formato que o `openapi-fetch` devolve: sucesso com `data` ou falha com `error`. */
type FetchResult =
  | { data: unknown; error?: never; response: Response }
  | { data?: never; error: unknown; response: Response };

/**
 * O tipo de `data` no ramo de sucesso.
 *
 * Inferir direto de `{ data: T }` não serve: o ramo de erro declara `data?: never`, e o
 * TypeScript juntaria os dois, devolvendo `T | undefined` para toda chamada. O tipo
 * condicional descarta o ramo de erro, porque `data` opcional não satisfaz `data`
 * obrigatório.
 */
type SuccessData<R> = R extends { data: infer D } ? D : never;

/**
 * Transforma o resultado do `openapi-fetch` em valor ou exceção.
 *
 * O `openapi-fetch` não lança em 4xx/5xx; devolve `{ error }`. O TanStack Query, por
 * outro lado, só entra em estado de erro quando a função lança. Este é o ponto de
 * encontro: toda falha vira um `ApiError`, com o `code` da API e o texto para a tela.
 */
export async function unwrap<R extends FetchResult>(
  request: Promise<R>,
): Promise<SuccessData<R>> {
  let result: R;
  try {
    result = await request;
  } catch (cause) {
    // `fetch` só lança quando não houve resposta: rede, CORS ou API fora do ar.
    throw ApiError.network(cause);
  }

  if (result.error !== undefined || !result.response.ok) {
    throw ApiError.fromResponse(result.response.status, result.error);
  }

  // Aqui `result` é o ramo de sucesso, mas o TypeScript não estreita genéricos.
  return result.data as SuccessData<R>;
}
