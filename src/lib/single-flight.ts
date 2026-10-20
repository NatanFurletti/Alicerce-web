/**
 * Garante uma única execução em andamento de uma função assíncrona.
 *
 * Enquanto a primeira chamada não termina, as seguintes recebem **a mesma promise**,
 * em vez de disparar outra execução. Terminada (com sucesso ou erro), a próxima
 * chamada executa de novo.
 *
 * Uso no projeto: a página de resultado faz várias requisições em paralelo. Se o
 * access token expirou, todas tomam 401 ao mesmo tempo; sem isto, cada uma pediria
 * uma renovação própria à API.
 */
export function singleFlight<T>(fn: () => Promise<T>): () => Promise<T> {
  let inFlight: Promise<T> | null = null;

  return () => {
    inFlight ??= fn().finally(() => {
      inFlight = null;
    });
    return inFlight;
  };
}
