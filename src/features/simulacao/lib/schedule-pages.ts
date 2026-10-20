/**
 * Tabela completa a partir da API paginada.
 *
 * A API devolve no máximo 100 linhas por página, uma proteção dela contra respostas
 * gigantes. Gráficos e CSV precisam das até 420 linhas, então o front pede as páginas
 * em paralelo e as junta.
 */

/** Números das páginas necessárias para cobrir `total` itens: 420 em 100 → [1..5]. */
export function schedulePageNumbers(total: number, pageSize: number): number[] {
  const pages = Math.ceil(total / pageSize);
  return Array.from({ length: pages }, (_, index) => index + 1);
}

/**
 * Junta as páginas ordenando por mês. As requisições correm em paralelo e podem
 * chegar fora de ordem: a ordem vem do dado, não da chegada.
 */
export function mergeSchedulePages<T extends { month: number }>(
  pages: readonly { items: readonly T[] }[],
): T[] {
  return pages.flatMap((page) => page.items).sort((a, b) => a.month - b.month);
}
