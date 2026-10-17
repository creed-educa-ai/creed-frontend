import { useTranslation } from 'react-i18next';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import type { Prisma } from '@/types/api';

export const PRISMA_DIMENSIONS: readonly Prisma[] = [
  'plasticidade_humana',
  'empreendedorismo',
  'multiculturalismo',
  'neuroinovacao',
  'tomada_decisao',
];

export type PrismaDimension = Prisma;
export type PrismaScores = Record<Prisma, number>;

export interface PrismaPeriod {
  label: string;
  scores: PrismaScores;
}

interface PrismaRadarChartProps {
  current: PrismaPeriod;
  previous?: PrismaPeriod;
  className?: string;
  // Versão reduzida para o dashboard: card com título dentro e radar menor.
  compact?: boolean;
}

interface TickProps {
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  payload?: { value?: PrismaDimension };
}

const chartConfig = {
  current: {
    label: 'dashboardPrisma:periodoAtual',
    color: 'var(--chart-1)',
  },
  previous: {
    label: 'dashboardPrisma:periodoAnterior',
    color: 'var(--chart-2)',
  },
};

function RadarMetricTick({
  tick,
  current,
  previous,
}: {
  tick: TickProps;
  current: PrismaScores;
  previous: PrismaScores | undefined;
}) {
  const { t } = useTranslation(['dashboardPrisma']);
  const dimension = tick.payload?.value;
  if (!dimension) return null;

  const x = tick.x ?? 0;
  const y = tick.y ?? 0;
  const centerX = tick.cx ?? 0;
  const centerY = tick.cy ?? 0;
  const anchor = x > centerX + 8 ? 'start' : x < centerX - 8 ? 'end' : 'middle';
  const previousValue = previous?.[dimension];

  return (
    <text x={x} y={y} textAnchor={anchor} className="text-[10px] sm:text-xs">
      <tspan
        x={x}
        dy={y > centerY ? 11 : -2}
        fill="var(--foreground)"
        fontSize="10"
        fontWeight="500"
      >
        {t(`dashboardPrisma:dimensoes.${dimension}`)}
      </tspan>
      <tspan
        x={x}
        dy="15"
        fill={chartConfig.current.color}
        fontSize="12"
        fontWeight="700"
      >
        {String(current[dimension])}
      </tspan>
      {previousValue !== undefined && (
        <>
          <tspan dx="4" fill="var(--muted-foreground)" fontSize="11">
            /
          </tspan>
          <tspan
            dx="4"
            fill={chartConfig.previous.color}
            fontSize="12"
            fontWeight="700"
          >
            {String(previousValue)}
          </tspan>
        </>
      )}
    </text>
  );
}

export function PrismaRadarChart({
  current,
  previous,
  className,
  compact = false,
}: PrismaRadarChartProps) {
  const { t } = useTranslation(['dashboardPrisma']);
  const chartData = PRISMA_DIMENSIONS.map((dimension) => ({
    dimension,
    current: current.scores[dimension],
    previous: previous?.scores[dimension],
  }));
  const label = previous
    ? t('dashboardPrisma:descricaoComComparacao', {
        atual: current.label,
        anterior: previous.label,
      })
    : t('dashboardPrisma:descricaoSemComparacao', { atual: current.label });

  return (
    <figure className={compact ? `h-full ${className ?? ''}` : className}>
      {/* Título e legenda: só na versão completa */}
      {!compact && (
        <>
          <figcaption className="mb-3">
            <h2 className="text-lg font-semibold text-heading">
              {t('dashboardPrisma:titulo')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </figcaption>

          <div className="mb-3 flex flex-wrap gap-2">
            <span
              className="inline-flex items-center gap-2 rounded-md border border-border bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-foreground)',
              }}
            >
              <span
                aria-hidden="true"
                className="w-5 border-t-[3px]"
                style={{ borderColor: chartConfig.current.color }}
              />
              {current.label}
            </span>
            {previous && (
              <span
                className="inline-flex items-center gap-2 rounded-md border border-border bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                }}
              >
                <span
                  aria-hidden="true"
                  className="w-5 border-t-2 border-dashed"
                  style={{ borderColor: chartConfig.previous.color }}
                />
                {previous.label}
              </span>
            )}
          </div>
        </>
      )}

      <div
        className={
          compact
            ? 'h-full rounded-2xl bg-card p-5 shadow-sm'
            : 'rounded-lg border border-border bg-card px-2 py-3 shadow-sm sm:px-5 sm:py-4'
        }
        style={{ backgroundColor: 'var(--card)' }}
      >
        {/* Na versão compacta o título fica dentro do card, como no Figma */}
        {compact && (
          <h3 className="text-xl font-bold text-heading">
            {t('dashboardPrisma:titulo')}
          </h3>
        )}

        <ChartContainer
          id="prisma-radar"
          config={chartConfig}
          className="text-xs"
          style={{
            height: compact ? '240px' : 'clamp(350px, 55vw, 430px)',
            color: 'var(--foreground)',
          }}
          aria-label={label}
        >
          <RadarChart
            data={chartData}
            outerRadius="62%"
            margin={{ top: 20, right: 32, bottom: 20, left: 32 }}
          >
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={(tick) => (
                <RadarMetricTick
                  tick={tick as TickProps}
                  current={current.scores}
                  previous={previous?.scores}
                />
              )}
            />
            <PolarRadiusAxis
              domain={[0, 100]}
              tickCount={6}
              axisLine={false}
              tickLine={false}
              tick={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                const firstPayload = payload.at(0);
                if (!active || !firstPayload) return null;
                const point = firstPayload.payload as
                  (typeof chartData)[number] | undefined;
                if (!point) return null;

                return (
                  <div
                    className="rounded-md border border-border bg-popover px-3 py-2 text-popover-foreground shadow-md"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--popover)',
                      color: 'var(--popover-foreground)',
                    }}
                  >
                    <p className="font-medium">
                      {t(`dashboardPrisma:dimensoes.${point.dimension}`)}
                    </p>
                    <p style={{ color: chartConfig.current.color }}>
                      {current.label}: {String(point.current)}
                    </p>
                    {previous !== undefined && (
                      <p style={{ color: chartConfig.previous.color }}>
                        {previous.label}: {String(point.previous)}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Radar
              name={current.label}
              dataKey="current"
              stroke="var(--color-current)"
              fill="var(--color-current)"
              fillOpacity={0.18}
              strokeWidth={2}
              isAnimationActive={false}
            />
            {previous && (
              <Radar
                name={previous.label}
                dataKey="previous"
                stroke="var(--color-previous)"
                fill="var(--color-previous)"
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="5 4"
                isAnimationActive={false}
              />
            )}
          </RadarChart>
        </ChartContainer>
      </div>

      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th>{t('dashboardPrisma:dimensao')}</th>
            <th>{current.label}</th>
            {previous && <th>{previous.label}</th>}
          </tr>
        </thead>
        <tbody>
          {PRISMA_DIMENSIONS.map((dimension) => (
            <tr key={dimension}>
              <th>{t(`dashboardPrisma:dimensoes.${dimension}`)}</th>
              <td>{String(current.scores[dimension])}</td>
              {previous && <td>{String(previous.scores[dimension])}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
