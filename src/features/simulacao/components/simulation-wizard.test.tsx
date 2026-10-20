import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api/errors';
import { renderWithProviders } from '@/test/render';

import { createSimulation } from '../services/simulation-service';
import { SimulationWizard } from './simulation-wizard';

const router = { push: vi.fn(), replace: vi.fn() };

vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('../services/simulation-service', () => ({ createSimulation: vi.fn() }));

beforeEach(() => {
  vi.mocked(createSimulation).mockReset();
  router.push.mockReset();
});

/** Título da etapa atual: o formulário é nomeado por ele. */
function stepHeading() {
  return within(screen.getByRole('form')).getByRole('heading', { level: 2 });
}

async function next(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: 'Próximo' }));
}

/** Preenche as três primeiras etapas e chega à última. */
async function fillUntilLastStep(user: UserEvent, downPayment = '80.000,00') {
  await user.type(screen.getByLabelText('Valor do imóvel (R$)'), '500.000,00');
  await next(user);
  await user.type(
    screen.getByLabelText('Entrada com recursos próprios (R$)'),
    downPayment,
  );
  await user.type(screen.getByLabelText('FGTS (R$, opcional)'), '20.000,00');
  await next(user);
  await user.type(
    screen.getByLabelText('Renda bruta familiar mensal (R$, opcional)'),
    '20.000,00',
  );
  await next(user);
}

describe('SimulationWizard', () => {
  it('não avança com a etapa inválida, e o erro fica ligado ao campo', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SimulationWizard />);

    await next(user);

    expect(stepHeading()).toHaveTextContent('Imóvel');
    const field = screen.getByLabelText('Valor do imóvel (R$)');
    expect(field).toHaveAccessibleDescription('Informe o valor do imóvel.');
    expect(field).toHaveFocus();
  });

  it('acusa a entrada maior que o imóvel já na etapa da entrada', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SimulationWizard />);

    await user.type(screen.getByLabelText('Valor do imóvel (R$)'), '500.000,00');
    await next(user);
    await user.type(
      screen.getByLabelText('Entrada com recursos próprios (R$)'),
      '600.000',
    );
    await next(user);

    expect(stepHeading()).toHaveTextContent('Entrada e FGTS');
    expect(
      screen.getByLabelText('Entrada com recursos próprios (R$)'),
    ).toHaveAccessibleDescription(/menor que o valor do imóvel/);
  });

  it('mostra o valor interpretado e o resumo ao vivo', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SimulationWizard />);

    await user.type(screen.getByLabelText('Valor do imóvel (R$)'), '500000');

    expect(screen.getByLabelText('Valor do imóvel (R$)')).toHaveAccessibleDescription(
      'Entendido como R$\u00a0500.000,00.',
    );
    expect(
      screen.getByRole('complementary', { name: 'Resumo do financiamento' }),
    ).toHaveTextContent(/Financiado\s*R\$\s500\.000,00/);
  });

  it('fluxo completo: envia o corpo no formato da API e abre o resultado', async () => {
    vi.mocked(createSimulation).mockResolvedValue({ id: 'sim-123' } as never);
    const user = userEvent.setup();
    renderWithProviders(<SimulationWizard />);

    await fillUntilLastStep(user);
    expect(stepHeading()).toHaveTextContent('Prazo e sistema');
    await user.type(screen.getByLabelText('Taxa de juros (% ao ano)'), '9,75');
    await user.click(screen.getByRole('radio', { name: /Price/ }));
    await user.click(screen.getByRole('button', { name: 'Simular' }));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/simulacoes/sim-123'));
    expect(vi.mocked(createSimulation).mock.calls[0]?.[0]).toEqual({
      propertyValueCents: 50_000_000,
      downPaymentCents: 10_000_000,
      termMonths: 360,
      annualRate: 0.0975,
      rateConvention: 'EFFECTIVE',
      amortizationSystem: 'PRICE',
      monthlyIncomeCents: 2_000_000,
      charges: { mipMonthlyRate: 0.00025, dfiMonthlyRate: 0.00005, adminFeeCents: 2500 },
    });
  });

  it('voltar preserva o que já foi digitado', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SimulationWizard />);

    await fillUntilLastStep(user);
    await user.click(screen.getByRole('button', { name: 'Voltar' }));
    await user.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(screen.getByLabelText('Entrada com recursos próprios (R$)')).toHaveValue(
      '80.000,00',
    );
  });

  it('LTV recusado pela API leva de volta à etapa da entrada, com o erro no campo', async () => {
    vi.mocked(createSimulation).mockRejectedValue(
      ApiError.fromResponse(422, { code: 'LTV_EXCEEDED', message: 'LTV de 90%' }),
    );
    const user = userEvent.setup();
    renderWithProviders(<SimulationWizard />);

    await fillUntilLastStep(user, '30.000,00');
    await user.type(screen.getByLabelText('Taxa de juros (% ao ano)'), '9,75');
    await user.click(screen.getByRole('button', { name: 'Simular' }));

    await waitFor(() => expect(stepHeading()).toHaveTextContent('Entrada e FGTS'));
    const field = screen.getByLabelText('Entrada com recursos próprios (R$)');
    expect(field).toHaveAccessibleDescription(/Aumente a entrada/);
    await waitFor(() => expect(field).toHaveFocus());
    expect(router.push).not.toHaveBeenCalled();
  });

  it('erro que não é de um campo aparece como alerta na etapa atual', async () => {
    vi.mocked(createSimulation).mockRejectedValue(
      ApiError.network(new TypeError('offline')),
    );
    const user = userEvent.setup();
    renderWithProviders(<SimulationWizard />);

    await fillUntilLastStep(user);
    await user.type(screen.getByLabelText('Taxa de juros (% ao ano)'), '9,75');
    await user.click(screen.getByRole('button', { name: 'Simular' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /Não foi possível conectar/,
    );
    expect(stepHeading()).toHaveTextContent('Prazo e sistema');
  });
});
