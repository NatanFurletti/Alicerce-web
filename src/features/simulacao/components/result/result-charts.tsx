'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCompactCurrency, formatCurrency, formatPercent } from '@/lib/format';
import { toCents } from '@/lib/money';

import {
  type BalancePoint,
  type CompositionPoint,
  toBalanceSeries,
  toCompositionSeries,
  yearTicks,
} from '../../lib/chart-data';
import type { ScheduleEntry } from '../../services/simulation-service';

/**
 * Os dois gráficos da simulação.
 *
 * Especificação visual (skill de dataviz do projeto):
 * - cores categóricas validadas para daltonismo, em ordem fixa, vindas dos tokens
 *   `--chart-1..3` de globals.css, com versões próprias para o tema escuro;
 * - linhas de 2px, área a ~10% de opacidade, grade e eixos discretos;
 * - um eixo só (nada de eixo duplo);
 * - legenda sempre que houver 2 ou mais séries, com o texto na cor do texto, nunca
 *   na cor da série;
 * - tooltip ao passar o mouse;
 * - a tabela de amortização logo abaixo é a alternativa em texto aos gráficos.
 */

const SERIES = {
  amortization: { label: 'Amortização', color: 'var(--chart-1)' },
  interest: { label: 'Juros', color: 'var(--chart-2)' },
  charges: { label: 'Seguros e taxa', color: 'var(--chart-3)' },
} as const;

const AXIS = {
  stroke: 'var(--border)',
  tick: { fill: 'var(--muted-foreground)', fontSize: 12 },
};
const HEIGHT = 260;

function monthLabel(month: number): string {
  if (month === 0) return 'Início';
  return `Ano ${month / 12}`;
}

function TooltipBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-popover text-popover-foreground rounded-lg border px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium">{title}</p>
      {children}
    </div>
  );
}

function TooltipRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <p className="flex items-center gap-2">
      <span
        aria-hidden
        className="size-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto pl-3 tabular-nums">{value}</span>
    </p>
  );
}

function monthTitle(month: number): string {
  return month === 0 ? 'Contratação' : `Mês ${month} (ano ${Math.ceil(month / 12)})`;
}

export function BalanceChart({ schedule }: { schedule: ScheduleEntry[] }) {
  const data = toBalanceSeries(schedule);
  const months = schedule.length;
  const first = data[0]?.balance ?? 0;

  return (
    <figure className="flex flex-col gap-3 rounded-xl border p-4">
      <figcaption>
        <h3 className="font-semibold">Evolução do saldo devedor</h3>
        <p className="text-muted-foreground text-sm">
          O saldo começa em {formatCurrency(toCents(first))} e chega a zero no mês{' '}
          {months}.
        </p>
      </figcaption>
      <div style={{ height: HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
            <XAxis
              dataKey="month"
              type="number"
              domain={[0, months]}
              ticks={yearTicks(months)}
              tickFormatter={monthLabel}
              {...AXIS}
            />
            <YAxis tickFormatter={formatCompactCurrency} width={76} {...AXIS} />
            <Tooltip
              cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                const point = payload?.[0]?.payload as BalancePoint | undefined;
                if (!active || !point) return null;
                return (
                  <TooltipBox title={monthTitle(point.month)}>
                    <TooltipRow
                      color={SERIES.amortization.color}
                      label="Saldo devedor"
                      value={formatCurrency(toCents(point.balance))}
                    />
                  </TooltipBox>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              name="Saldo devedor"
              stroke={SERIES.amortization.color}
              strokeWidth={2}
              fill={SERIES.amortization.color}
              fillOpacity={0.1}
              isAnimationActive={false}
              activeDot={{ r: 4, stroke: 'var(--background)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

export function CompositionChart({ schedule }: { schedule: ScheduleEntry[] }) {
  const data = toCompositionSeries(schedule);
  const months = schedule.length;
  const interestShare = (point: CompositionPoint | undefined) =>
    point
      ? formatPercent(
          point.interest / (point.interest + point.amortization + point.charges),
          0,
        )
      : '';

  return (
    <figure className="flex flex-col gap-3 rounded-xl border p-4">
      <figcaption>
        <h3 className="font-semibold">Composição da parcela</h3>
        <p className="text-muted-foreground text-sm">
          Na primeira parcela, {interestShare(data[0])} é juros; na última,{' '}
          {interestShare(data.at(-1))}.
        </p>
      </figcaption>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-label="Legenda">
        {Object.values(SERIES).map((series) => (
          <li key={series.label} className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2.5 rounded-sm"
              style={{ backgroundColor: series.color }}
            />
            {series.label}
          </li>
        ))}
      </ul>

      <div style={{ height: HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
            <XAxis
              dataKey="month"
              type="number"
              domain={[1, months]}
              ticks={yearTicks(months).filter((tick) => tick > 0)}
              tickFormatter={monthLabel}
              {...AXIS}
            />
            <YAxis tickFormatter={formatCompactCurrency} width={76} {...AXIS} />
            <Tooltip
              cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                const point = payload?.[0]?.payload as CompositionPoint | undefined;
                if (!active || !point) return null;
                return (
                  <TooltipBox title={monthTitle(point.month)}>
                    {(Object.keys(SERIES) as (keyof typeof SERIES)[]).map((key) => (
                      <TooltipRow
                        key={key}
                        color={SERIES[key].color}
                        label={SERIES[key].label}
                        value={formatCurrency(toCents(point[key]))}
                      />
                    ))}
                  </TooltipBox>
                );
              }}
            />
            {(Object.keys(SERIES) as (keyof typeof SERIES)[]).map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={SERIES[key].label}
                stackId="parcela"
                stroke={SERIES[key].color}
                strokeWidth={2}
                fill={SERIES[key].color}
                fillOpacity={0.12}
                isAnimationActive={false}
                activeDot={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
