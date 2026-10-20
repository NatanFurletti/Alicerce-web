import { describe, expect, it } from 'vitest';

import { mergeSchedulePages, schedulePageNumbers } from './schedule-pages';

describe('schedulePageNumbers', () => {
  it('420 meses em páginas de 100 são 5 páginas', () => {
    expect(schedulePageNumbers(420, 100)).toEqual([1, 2, 3, 4, 5]);
  });

  it('total múltiplo do tamanho não cria página vazia', () => {
    expect(schedulePageNumbers(300, 100)).toEqual([1, 2, 3]);
  });

  it('sem meses, nenhuma página', () => {
    expect(schedulePageNumbers(0, 100)).toEqual([]);
  });
});

describe('mergeSchedulePages', () => {
  it('junta as páginas em ordem de mês, mesmo que cheguem fora de ordem', () => {
    // As requisições correm em paralelo; a ordem de chegada não é garantida.
    const merged = mergeSchedulePages([
      { items: [{ month: 3 }, { month: 4 }] },
      { items: [{ month: 1 }, { month: 2 }] },
    ]);

    expect(merged.map((item) => item.month)).toEqual([1, 2, 3, 4]);
  });
});
