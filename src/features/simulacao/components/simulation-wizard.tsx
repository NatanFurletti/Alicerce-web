'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ApiError, getErrorMessage } from '@/lib/api/errors';

import { useCreateSimulation } from '../hooks/use-create-simulation';
import { apiErrorTarget } from '../lib/api-error-target';
import { toCreateSimulationBody } from '../lib/to-request';
import {
  SIMULATION_FORM_DEFAULTS,
  type SimulationFormInput,
  type SimulationFormValues,
  simulationFormSchema,
  STEP_FIELDS,
} from '../schemas/simulation-form';
import { FinancingSummary } from './financing-summary';
import { DownPaymentStep, IncomeStep, PropertyStep, TermStep } from './wizard-steps';

const STEP_CONTENT = [PropertyStep, DownPaymentStep, IncomeStep, TermStep];
const LAST_STEP = STEP_FIELDS.length - 1;
/** O título da etapa também nomeia o formulário: o leitor de tela anuncia "formulário Imóvel". */
const STEP_TITLE_ID = 'wizard-step-title';

/**
 * Simulador em etapas.
 *
 * **Um único formulário para as quatro etapas.** Voltar não perde nada, e o envio
 * final valida tudo de uma vez. Avançar valida só os campos da etapa atual
 * (`trigger` com a lista de `STEP_FIELDS`).
 */
export function SimulationWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Campo a focar depois da troca de etapa: ele só existe no DOM depois que a nova
  // etapa renderiza. Ref, e não estado, porque mudar o foco não pede nova renderização.
  const pendingFocus = useRef<keyof SimulationFormInput | null>(null);
  const isFirstRender = useRef(true);

  const form = useForm<SimulationFormInput, unknown, SimulationFormValues>({
    resolver: zodResolver(simulationFormSchema),
    defaultValues: SIMULATION_FORM_DEFAULTS,
  });
  const createSimulation = useCreateSimulation();

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Ao trocar de etapa, o foco vai para o título (ou para o campo com erro), para
    // quem usa teclado ou leitor de tela não ficar perdido no fim da página.
    if (pendingFocus.current !== null) {
      form.setFocus(pendingFocus.current);
      pendingFocus.current = null;
    } else {
      headingRef.current?.focus();
    }
  }, [step, form]);

  function submitValues(values: SimulationFormValues) {
    createSimulation.mutate(toCreateSimulationBody(values), {
      onSuccess: (simulation) => router.push(`/simulacoes/${simulation.id}`),
      onError: (error) => {
        // Regra de negócio recusada pela API: leva o usuário ao campo que a corrige.
        const target = error instanceof ApiError ? apiErrorTarget(error.code) : null;
        if (target === null) return;
        form.setError(target.field, { message: error.message });
        pendingFocus.current = target.field;
        setStep(target.step);
      },
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // O Enter num campo envia o formulário. Antes da última etapa, ele avança.
    if (step < LAST_STEP) {
      event.preventDefault();
      const valid = await form.trigger([...STEP_FIELDS[step]!.fields], {
        shouldFocus: true,
      });
      if (valid) setStep(step + 1);
      return;
    }
    await form.handleSubmit(submitValues)(event);
  }

  const current = STEP_FIELDS[step]!;
  const StepContent = STEP_CONTENT[step]!;
  const apiError = createSimulation.error;
  const showApiAlert =
    createSimulation.isError &&
    !(apiError instanceof ApiError && apiErrorTarget(apiError.code) !== null);

  return (
    <FormProvider {...form}>
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <form
          onSubmit={handleSubmit}
          noValidate
          aria-labelledby={STEP_TITLE_ID}
          className="flex flex-col gap-6"
        >
          <ol className="flex gap-2" aria-label="Etapas da simulação">
            {STEP_FIELDS.map((item, index) => (
              <li
                key={item.title}
                aria-current={index === step ? 'step' : undefined}
                className="flex flex-1 flex-col gap-1"
              >
                <span
                  className={`h-1.5 rounded-full ${index <= step ? 'bg-primary' : 'bg-muted'}`}
                />
                <span
                  className={`hidden text-xs sm:block ${index === step ? 'font-medium' : 'text-muted-foreground'}`}
                >
                  {item.title}
                </span>
              </li>
            ))}
          </ol>

          <div>
            <p className="text-muted-foreground text-sm">
              Etapa {step + 1} de {STEP_FIELDS.length}
            </p>
            <h2
              id={STEP_TITLE_ID}
              ref={headingRef}
              tabIndex={-1}
              className="text-xl font-semibold tracking-tight outline-none"
            >
              {current.title}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">{current.description}</p>
          </div>

          {showApiAlert && (
            <Alert variant="destructive">
              <AlertDescription>{getErrorMessage(apiError)}</AlertDescription>
            </Alert>
          )}

          <StepContent />

          <div className="flex justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setStep(step - 1)}
              disabled={step === 0 || createSimulation.isPending}
            >
              Voltar
            </Button>
            <Button type="submit" size="lg" disabled={createSimulation.isPending}>
              {step < LAST_STEP
                ? 'Próximo'
                : createSimulation.isPending
                  ? 'Calculando…'
                  : 'Simular'}
            </Button>
          </div>
        </form>

        <FinancingSummary />
      </div>
    </FormProvider>
  );
}
