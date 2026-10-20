import { describe, expect, it, vi } from 'vitest';

import { singleFlight } from './single-flight';

describe('singleFlight', () => {
  it('chamadas simultâneas compartilham uma única execução', async () => {
    const fn = vi.fn(async () => 'token');
    const run = singleFlight(fn);

    const results = await Promise.all([run(), run(), run()]);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(results).toEqual(['token', 'token', 'token']);
  });

  it('depois de terminar, a próxima chamada executa de novo', async () => {
    const fn = vi.fn(async () => 'token');
    const run = singleFlight(fn);

    await run();
    await run();

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('libera a próxima execução mesmo quando a anterior falha', async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error('falhou')).mockResolvedValue('ok');
    const run = singleFlight(fn);

    await expect(run()).rejects.toThrow('falhou');
    await expect(run()).resolves.toBe('ok');
  });
});
