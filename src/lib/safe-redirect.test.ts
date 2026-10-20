import { describe, expect, it } from 'vitest';

import { getSafeRedirect } from './safe-redirect';

const FALLBACK = '/simular';

describe('getSafeRedirect', () => {
  it('aceita caminhos internos, com query string', () => {
    expect(getSafeRedirect('/simulacoes', FALLBACK)).toBe('/simulacoes');
    expect(getSafeRedirect('/simulacoes/abc?pagina=2', FALLBACK)).toBe(
      '/simulacoes/abc?pagina=2',
    );
  });

  it('usa o padrão quando não há destino', () => {
    expect(getSafeRedirect(null, FALLBACK)).toBe(FALLBACK);
    expect(getSafeRedirect(undefined, FALLBACK)).toBe(FALLBACK);
    expect(getSafeRedirect('', FALLBACK)).toBe(FALLBACK);
  });

  it('recusa destinos externos (open redirect)', () => {
    for (const malicious of [
      'https://site-falso.com',
      '//site-falso.com',
      '/\\site-falso.com',
      'javascript:alert(1)',
      'simulacoes',
    ]) {
      expect(getSafeRedirect(malicious, FALLBACK)).toBe(FALLBACK);
    }
  });
});
