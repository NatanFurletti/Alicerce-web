import { describe, expect, it } from 'vitest';

import { pageAfterDeletion, pageSummary, parsePageParam } from './history-pagination';

describe('pageSummary', () => {
  it('descreve o intervalo mostrado e o total', () => {
    expect(pageSummary({ total: 35, page: 2, pageSize: 10 })).toEqual({
      totalPages: 4,
      from: 11,
      to: 20,
      hasPrevious: true,
      hasNext: true,
    });
  });

  it('a última página termina no total, não no tamanho da página', () => {
    expect(pageSummary({ total: 35, page: 4, pageSize: 10 })).toMatchObject({
      from: 31,
      to: 35,
      hasNext: false,
    });
  });

  it('lista vazia tem uma página, sem anterior nem próxima', () => {
    expect(pageSummary({ total: 0, page: 1, pageSize: 10 })).toEqual({
      totalPages: 1,
      from: 0,
      to: 0,
      hasPrevious: false,
      hasNext: false,
    });
  });
});

describe('pageAfterDeletion', () => {
  it('continua na mesma página quando ainda sobram itens nela', () => {
    expect(pageAfterDeletion({ total: 35, page: 2, pageSize: 10 })).toBe(2);
  });

  it('volta uma página ao excluir o único item da última', () => {
    // 31 itens: a página 4 tem só o item 31. Sem isto, o usuário ficaria numa
    // página vazia, com "nenhuma simulação" mesmo tendo 30 salvas.
    expect(pageAfterDeletion({ total: 31, page: 4, pageSize: 10 })).toBe(3);
  });

  it('nunca vai abaixo da página 1', () => {
    expect(pageAfterDeletion({ total: 1, page: 1, pageSize: 10 })).toBe(1);
  });
});

describe('parsePageParam', () => {
  it('lê a página da URL', () => {
    expect(parsePageParam('3')).toBe(3);
  });

  it('valor ausente ou inválido vira página 1, sem quebrar a tela', () => {
    // A URL é editável: "?pagina=abc" não pode virar requisição inválida à API.
    for (const value of [null, '', 'abc', '0', '-2', '1.5']) {
      expect(parsePageParam(value)).toBe(1);
    }
  });
});
