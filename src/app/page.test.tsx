import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from './page';

describe('HomePage', () => {
  it('apresenta o nome do produto como título principal', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Alicerce' }),
    ).toBeInTheDocument();
  });
});
