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
  // Título do card na versão compacta; o padrão é "Prisma de competências".
  title?: string;
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

// Versão compacta: rótulos maiores e todos fora do radar. O de cima fica acima
// do vértice, os de baixo abaixo, e os laterais saem para o lado. Nome com
// espaço quebra em duas linhas, para o rótulo lateral caber em card estreito.
const COMPACT_NAME_SIZE = 13;
const COMPACT_VALUE_SIZE = 16;
const COMPACT_NAME_LINE = COMPACT_NAME_SIZE + 3;
const COMPACT_VALUE_LINE = COMPACT_VALUE_SIZE + 4;
// O recharts desenha o rótulo 8px além do vértice.
const TICK_OFFSET = 8;
// Folga extra no topo: a estimativa da altura do texto não bastou e o nome do
// vértice de cima saía cortado pela borda do gráfico.
const TOP_SAFETY = 16;

// "Tomada de decisão" → ["Tomada de", "decisão"]: quebra no último espaço.
function splitName(name: string) {
  const lastSpace = name.lastIndexOf(' ');
  if (lastSpace === -1) return [name];
  return [name.slice(0, lastSpace), name.slice(lastSpace + 1)];
}

// Largura estimada de um texto: ~0,6 do tamanho da fonte por caractere.
function textWidth(text: string, fontSize: number) {
  return Math.ceil(text.length * fontSize * 0.6);
}

// Altura do rótulo, do topo do nome à base do valor.
function labelHeight(name: string) {
  const lines = splitName(name).length;
  return (
    COMPACT_NAME_SIZE + (lines - 1) * COMPACT_NAME_LINE + COMPACT_VALUE_LINE
  );
}

// Espaço reservado aos rótulos em volta do radar. Com isso como margem e o
// raio em 100%, o recharts dá ao radar todo o espaço que sobra. Ele desenha
// em sentido horário a partir do topo: o 1º nome é o vértice de cima, o 2º o
// lateral direito, o 3º e o 4º os de baixo e o último o lateral esquerdo.
function compactMargin(names: string[], withPrevious: boolean) {
  const valueWidth = textWidth(
    withPrevious ? '100 / 100' : '100',
    COMPACT_VALUE_SIZE,
  );
  const labelWidth = (name: string) =>
    Math.max(
      valueWidth,
      ...splitName(name).map((line) => textWidth(line, COMPACT_NAME_SIZE)),
    );
  const [top = '', right = '', bottomRight = '', bottomLeft = '', left = ''] =
    names;

  return {
    top: labelHeight(top) + TICK_OFFSET + TOP_SAFETY,
    right: labelWidth(right) + TICK_OFFSET,
    bottom:
      Math.max(labelHeight(bottomRight), labelHeight(bottomLeft)) + TICK_OFFSET,
    left: labelWidth(left) + TICK_OFFSET,
  };
}

function PeriodLegend({
  current,
  previous,
}: {
  current: PrismaPeriod;
  previous: PrismaPeriod | undefined;
}) {
  return (
    <div className="flex flex-wrap gap-2">
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
  );
}

function RadarMetricTick({
  tick,
  current,
  previous,
  compact,
}: {
  tick: TickProps;
  current: PrismaScores;
  previous: PrismaScores | undefined;
  compact: boolean;
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

  if (compact) {
    const lines = splitName(t(`dashboardPrisma:dimensoes.${dimension}`));
    const below = y > centerY;
    const upperSide = !below && anchor !== 'middle';
    // Distância da base da primeira linha à base do valor.
    const span = (lines.length - 1) * COMPACT_NAME_LINE + COMPACT_VALUE_LINE;
    // Abaixo do vértice; ao lado dele, centralizado na altura; ou acima.
    const firstDy = below
      ? COMPACT_NAME_SIZE + 2
      : upperSide
        ? COMPACT_NAME_SIZE / 2 - span / 2
        : -2 - span;

    return (
      <text x={x} y={y} textAnchor={upperSide ? anchor : 'middle'}>
        {lines.map((line, index) => (
          <tspan
            key={line}
            x={x}
            dy={index === 0 ? firstDy : COMPACT_NAME_LINE}
            fill="var(--foreground)"
            fontSize={COMPACT_NAME_SIZE}
            fontWeight="500"
          >
            {line}
          </tspan>
        ))}
        <tspan
          x={x}
          dy={COMPACT_VALUE_LINE}
          fill={chartConfig.current.color}
          fontSize={COMPACT_VALUE_SIZE}
          fontWeight="700"
        >
          {String(current[dimension])}
          {previousValue !== undefined && (
            <tspan fill={chartConfig.previous.color}>
              {` / ${String(previousValue)}`}
            </tspan>
          )}
        </tspan>
      </text>
    );
  }

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
  title,
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
  const names = PRISMA_DIMENSIONS.map((dimension) =>
    t(`dashboardPrisma:dimensoes.${dimension}`),
  );

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

          <div className="mb-3">
            <PeriodLegend current={current} previous={previous} />
          </div>
        </>
      )}

      <div
        className={
          compact
            ? 'flex h-full flex-col rounded-2xl bg-card p-5 shadow-sm'
            : 'rounded-lg border border-border bg-card px-2 py-3 shadow-sm sm:px-5 sm:py-4'
        }
        style={{ backgroundColor: 'var(--card)' }}
      >
        {/* Na versão compacta título e legenda ficam dentro do card, como no
            Figma. A legenda aparece mesmo com um período só: assim os dois
            radares do dashboard têm a mesma estrutura e o mesmo tamanho. */}
        {compact && (
          <>
            <h3 className="text-xl font-bold text-heading">
              {title ?? t('dashboardPrisma:titulo')}
            </h3>
            <div className="mt-3">
              <PeriodLegend current={current} previous={previous} />
            </div>
          </>
        )}

        {/* Na versão compacta o radar ocupa a altura que sobra no card, com
            300px de piso para quando o card estiver sozinho (celular). */}
        <ChartContainer
          id="prisma-radar"
          config={chartConfig}
          className={compact ? 'mt-4 min-h-[300px] flex-1 text-xs' : 'text-xs'}
          style={{
            height: compact ? undefined : 'clamp(350px, 55vw, 430px)',
            color: 'var(--foreground)',
          }}
          aria-label={label}
        >
          <RadarChart
            data={chartData}
            outerRadius={compact ? '100%' : '62%'}
            margin={
              compact
                ? compactMargin(names, previous !== undefined)
                : { top: 20, right: 32, bottom: 20, left: 32 }
            }
          >
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={(tick) => (
                <RadarMetricTick
                  tick={tick as TickProps}
                  current={current.scores}
                  previous={previous?.scores}
                  compact={compact}
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
