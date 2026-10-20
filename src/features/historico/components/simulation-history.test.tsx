import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api/errors';
import { renderWithProviders } from '@/test/render';

import {
  deleteSimulation,
  listSimulations,
  type SimulationListItem,
} from '../services/history-service';
import { SimulationHistory } from './simulation-history';

const router = { replace: vi.fn(), push: vi.fn() };
let searchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => '/simulacoes',
  useSearchParams: () => searchParams,
}));

vi.mock('../services/history-service', () => ({
  listSimulations: vi.fn(),
  deleteSimulation: vi.fn(),
}));

function item(index: number): SimulationListItem {
  return {
    id: `sim-${index}`,
    propertyValueCents: 50_000_000 + index * 100_000,
    financedAmountCents: 40_000_000,
    termMonths: 360,
    annualRate: 0.0975,
    amortizationSystem: index % 2 === 0 ? 'SAC' : 'PRICE',
    createdAt: '2026-10-19T12:00:00Z',
  };
}

function page(items: SimulationListItem[], total: number, pageNumber = 1) {
  return { items, total, page: pageNumber, pageSize: 10 };
}

beforeEach(() => {
  vi.mocked(listSimulations).mockReset();
  vi.mocked(deleteSimulation).mockReset();
  router.replace.mockReset();
  searchParams = new URLSearchParams();
});

describe('SimulationHistory', () => {
  it('lista as simulações com os dados formatados e o link para o resultado', async () => {
    vi.mocked(listSimulations).mockResolvedValue(page([item(1)], 1));
    renderWithProviders(<SimulationHistory />);

    const link = await screen.findByRole('link', {
      name: /^Imóvel de R\$\s501\.000,00$/,
    });
    expect(link).toHaveAttribute('href', '/simulacoes/sim-1');
    expect(
      screen.getByText(
        /Financiado R\$\s400\.000,00 · Price · 360 meses \(30 anos\) · 9,75% a\.a\./,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Simulada em 19/10/2026')).toBeInTheDocument();
  });

  it('sem simulações, convida a fazer a primeira', async () => {
    vi.mocked(listSimulations).mockResolvedValue(page([], 0));
    renderWithProviders(<SimulationHistory />);

    expect(await screen.findByText('Nenhuma simulação ainda')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Fazer a primeira simulação' }),
    ).toHaveAttribute('href', '/simular');
  });

  it('lê a página da URL e navega mudando a URL', async () => {
    searchParams = new URLSearchParams({ pagina: '2' });
    vi.mocked(listSimulations).mockResolvedValue(
      page(
        Array.from({ length: 10 }, (_, i) => item(i + 10)),
        35,
        2,
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<SimulationHistory />);

    expect(await screen.findByText('11–20 de 35')).toBeInTheDocument();
    expect(listSimulations).toHaveBeenCalledWith(2, 10);

    await user.click(screen.getByRole('button', { name: 'Próxima' }));
    expect(router.replace).toHaveBeenCalledWith('/simulacoes?pagina=3');

    await user.click(screen.getByRole('button', { name: 'Anterior' }));
    // A página 1 é a URL limpa, sem `?pagina=1`.
    expect(router.replace).toHaveBeenLastCalledWith('/simulacoes');
  });

  it('exclui só depois de confirmar, e anuncia o resultado', async () => {
    vi.mocked(listSimulations).mockResolvedValue(page([item(1), item(2)], 2));
    vi.mocked(deleteSimulation).mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderWithProviders(<SimulationHistory />);

    await user.click(
      await screen.findByRole('button', { name: /^Excluir: Imóvel de R\$\s501/ }),
    );
    const dialog = await screen.findByRole('alertdialog', { name: 'Excluir simulação?' });
    expect(within(dialog).getByText(/Não dá para desfazer/)).toBeInTheDocument();
    expect(deleteSimulation).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(vi.mocked(deleteSimulation).mock.calls[0]?.[0]).toBe('sim-1');
    expect(screen.getByRole('status')).toHaveTextContent('Simulação excluída.');
    // Foi a primeira página com itens sobrando: não muda de página.
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('cancelar não exclui nada', async () => {
    vi.mocked(listSimulations).mockResolvedValue(page([item(1)], 1));
    const user = userEvent.setup();
    renderWithProviders(<SimulationHistory />);

    await user.click(await screen.findByRole('button', { name: /^Excluir:/ }));
    await user.click(await screen.findByRole('button', { name: 'Cancelar' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(deleteSimulation).not.toHaveBeenCalled();
  });

  it('excluir o único item da última página volta para a anterior', async () => {
    searchParams = new URLSearchParams({ pagina: '4' });
    vi.mocked(listSimulations).mockResolvedValue(page([item(31)], 31, 4));
    vi.mocked(deleteSimulation).mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderWithProviders(<SimulationHistory />);

    await user.click(await screen.findByRole('button', { name: /^Excluir:/ }));
    const dialog = await screen.findByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Excluir' }));

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith('/simulacoes?pagina=3'),
    );
  });

  it('se a exclusão falha, o erro aparece no diálogo, que continua aberto', async () => {
    vi.mocked(listSimulations).mockResolvedValue(page([item(1)], 1));
    vi.mocked(deleteSimulation).mockRejectedValue(
      ApiError.network(new TypeError('offline')),
    );
    const user = userEvent.setup();
    renderWithProviders(<SimulationHistory />);

    await user.click(await screen.findByRole('button', { name: /^Excluir:/ }));
    const dialog = await screen.findByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Excluir' }));

    expect(
      await within(dialog).findByText(/Não foi possível conectar/),
    ).toBeInTheDocument();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('erro ao carregar a lista oferece tentar de novo', async () => {
    vi.mocked(listSimulations).mockRejectedValue(
      ApiError.fromResponse(500, { code: 'INTERNAL_ERROR', message: 'x' }),
    );
    renderWithProviders(<SimulationHistory />);

    expect(await screen.findByText(/Erro inesperado no servidor/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
  });
});
