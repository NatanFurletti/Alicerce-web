import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from './page';

describe('HomePage', () => {
  it('explica o simulador num título principal', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /financiamento imobiliário/,
    );
  });

  it('leva ao simulador pelo botão principal', () => {
    render(<HomePage />);

    expect(screen.getByRole('link', { name: 'Simular financiamento' })).toHaveAttribute(
      'href',
      '/simular',
    );
  });
});
