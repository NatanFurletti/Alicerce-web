import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api/errors';
import { renderWithProviders } from '@/test/render';

import {
  compareSystems,
  getSchedulePage,
  getSimulation,
  type ScheduleEntry,
  type Simulation,
  type SystemComparison,
} from '../../services/simulation-service';
import { SimulationResult } from './simulation-result';

vi.mock('../../services/simulation-service', () => ({
  getSimulation: vi.fn(),
  getSchedulePage: vi.fn(),
  compareSystems: vi.fn(),
}));

const MONTHS = 24;

const schedule: ScheduleEntry[] = Array.from({ length: MONTHS }, (_, index) => {
  const month = index + 1;
  const opening = 40_000_000 - index * 1_000_000;
  return {
    month,
    openingBalance: opening,
    interest: 300_000,
    amortization: 1_000_000,
    extraPayment: 0,
    mip: 10_000,
    dfi: 2_500,
    adminFee: 2_500,
    installment: 1_300_000,
    totalPayment: 1_315_000,
    closingBalance: opening - 1_000_000,
  };
});

const summary = {
  totalInterest: 7_200_000,
  totalAmortization: 24_000_000,
  totalMip: 240_000,
  totalDfi: 60_000,
  totalAdminFee: 60_000,
  totalPaid: 31_560_000,
  months: MONTHS,
};

const simulation: Simulation = {
  id: 'sim-1',
  userId: 'u1',
  financedAmountCents: 40_000_000,
  termMonths: MONTHS,
  monthlyRate: 0.0078,
  ltv: 0.8,
  firstInstallmentCents: 437_432,
  lastInstallmentCents: 170_000,
  summary,
  cet: { monthlyRate: 0.0082, annualRate: 0.103058 },
  createdAt: '2026-10-19T12:00:00Z',
  input: {
    propertyValueCents: 50_000_000,
    downPaymentCents: 10_000_000,
    termMonths: MONTHS,
    annualRate: 0.0975,
    rateConvention: 'EFFECTIVE',
    amortizationSystem: 'PRICE',
    // 437.432 / 1.600.000 = 27,3%: faixa de atenção.
    monthlyIncomeCents: 1_600_000,
    charges: { mipMonthlyRate: 0.00025, dfiMonthlyRate: 0.00005, adminFeeCents: 2500 },
  },
};

const system = (
  name: 'SAC' | 'PRICE',
  first: number,
  interest: number,
): SystemComparison => ({
  system: name,
  firstInstallmentCents: first,
  lastInstallmentCents: 170_000,
  summary: { ...summary, totalInterest: interest },
  cet: { monthlyRate: 0.008, annualRate: 0.1 },
});

const createObjectURL = vi.fn((_blob: Blob) => 'blob:csv');

beforeEach(() => {
  vi.mocked(getSimulation).mockResolvedValue(simulation);
  vi.mocked(getSchedulePage).mockImplementation(async (_id, page, pageSize) => ({
    items: schedule.slice((page - 1) * pageSize, page * pageSize),
    total: MONTHS,
    page,
    pageSize,
  }));
  vi.mocked(compareSystems).mockResolvedValue({
    financedAmountCents: 40_000_000,
    termMonths: MONTHS,
    sac: system('SAC', 480_000, 6_000_000),
    price: system('PRICE', 437_432, 7_200_000),
    interestDifferenceCents: 1_200_000,
  });
  URL.createObjectURL = createObjectURL;
  URL.revokeObjectURL = vi.fn();
  // O jsdom não navega: o clique no link de download só precisa acontecer.
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('SimulationResult', () => {
  it('mostra o resumo com valores em reais e o CET ao lado da taxa contratada', async () => {
    renderWithProviders(<SimulationResult id="sim-1" />);

    const financed = await screen.findByText('Valor financiado');
    expect(financed.nextElementSibling).toHaveTextContent(/R\$\s400\.000,00/);
    expect(screen.getByText('10,31% a.a.')).toBeInTheDocument();
    expect(screen.getByText('Taxa contratada: 9,75% a.a.')).toBeInTheDocument();
  });

  it('avisa quando a parcela está perto do limite de renda, por texto e não só cor', async () => {
    renderWithProviders(<SimulationResult id="sim-1" />);

    expect(
      await screen.findByText('Perto do limite: 27,3% da renda'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('meter', { name: 'Comprometimento da renda' }),
    ).toHaveAttribute('aria-valuetext', '27,3%');
  });

  it('compara SAC e Price, marcando o sistema escolhido e a diferença de juros', async () => {
    renderWithProviders(<SimulationResult id="sim-1" />);

    const table = await screen.findByRole('table', {
      name: /Comparação entre SAC e Price/,
    });
    expect(
      within(table).getByRole('columnheader', { name: /Price\s*sua escolha/ }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole('row', { name: /Primeira parcela.*4\.800,00.*4\.374,32/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No Price, você pagaria R\$\s12\.000,00 a mais de juros/),
    ).toBeInTheDocument();
    expect(compareSystems).toHaveBeenCalledWith(simulation.input);
  });

  it('pagina a tabela de amortização um ano por vez', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SimulationResult id="sim-1" />);

    const table = await screen.findByRole('table', {
      name: 'Tabela de amortização, ano 1 de 2',
    });
    await waitFor(() => expect(within(table).getAllByRole('row')).toHaveLength(13));
    expect(within(table).getByRole('rowheader', { name: '12' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Próximo ano' }));

    expect(await screen.findByRole('rowheader', { name: '13' })).toBeInTheDocument();
    expect(getSchedulePage).toHaveBeenCalledWith('sim-1', 2, 12);
    expect(screen.getByRole('button', { name: 'Próximo ano' })).toBeDisabled();
  });

  it('exporta todos os meses em CSV', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SimulationResult id="sim-1" />);

    const button = await screen.findByRole('button', { name: 'Exportar CSV' });
    await waitFor(() => expect(button).toBeEnabled());
    await user.click(button);

    const blob = createObjectURL.mock.calls[0]?.[0];
    const content = await blob!.text();
    const lines = content.replace('\uFEFF', '').split('\r\n');
    expect(lines).toHaveLength(MONTHS + 1);
    expect(lines[0]).toMatch(/^Mês;Saldo inicial;Juros/);
    expect(lines[24]).toMatch(/^24;/);
  });

  it('desenha os gráficos com a descrição em texto', async () => {
    renderWithProviders(<SimulationResult id="sim-1" />);

    expect(await screen.findByText('Evolução do saldo devedor')).toBeInTheDocument();
    expect(screen.getByText(/chega a zero no mês 24/)).toBeInTheDocument();
    expect(screen.getByText('Composição da parcela')).toBeInTheDocument();
  });

  it('simulação inexistente mostra uma mensagem clara, sem botão de tentar de novo', async () => {
    vi.mocked(getSimulation).mockRejectedValue(
      ApiError.fromResponse(404, { code: 'SIMULATION_NOT_FOUND', message: 'x' }),
    );
    renderWithProviders(<SimulationResult id="nao-existe" />);

    expect(
      await screen.findByRole('heading', { name: 'Simulação não encontrada' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Nova simulação' })).toHaveAttribute(
      'href',
      '/simular',
    );
  });
});
