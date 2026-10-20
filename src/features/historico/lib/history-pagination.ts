/** Paginação do histórico: contas puras, separadas da tela para serem testadas. */

interface PageState {
  /** Total de itens em todas as páginas, como a API devolve. */
  readonly total: number;
  /** Página atual, começando em 1. */
  readonly page: number;
  readonly pageSize: number;
}

export interface PageSummary {
  readonly totalPages: number;
  /** Posição do primeiro item mostrado (1-based), ou 0 se a lista está vazia. */
  readonly from: number;
  readonly to: number;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
}

function totalPages(total: number, pageSize: number): number {
  return Math.max(Math.ceil(total / pageSize), 1);
}

export function pageSummary({ total, page, pageSize }: PageState): PageSummary {
  const pages = totalPages(total, pageSize);
  return {
    totalPages: pages,
    from: total === 0 ? 0 : (page - 1) * pageSize + 1,
    to: Math.min(page * pageSize, total),
    hasPrevious: page > 1,
    hasNext: page < pages,
  };
}

/**
 * Página a exibir depois de excluir um item, com `total` contado **antes** da exclusão.
 *
 * Se o item excluído era o único da última página, ela deixa de existir, e mostrar
 * "nenhuma simulação" ali seria falso. Volta-se para a nova última página.
 */
export function pageAfterDeletion({ total, page, pageSize }: PageState): number {
  return Math.min(page, totalPages(total - 1, pageSize));
}

/**
 * Página vinda da URL (`?pagina=2`). A URL é editável pelo usuário, então qualquer
 * valor que não seja inteiro positivo vira 1, em vez de uma requisição inválida.
 */
export function parsePageParam(value: string | null): number {
  if (value === null || !/^\d+$/.test(value)) return 1;
  const page = Number(value);
  return page >= 1 ? page : 1;
}
