import { useTranslation } from 'react-i18next';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { PRISMAS } from '@/features/dashboards/prismas';
import type { Prisma } from '@/types/api';
import { InfoTip } from './InfoTip';
import { ShownChip } from './ShownChip';
import { cardTitleClassName, sectionTitleClassName } from '@/lib/typography';

export type PrismaScores = Record<Prisma, number>;

export interface PrismaSeries {
  label: string;
  scores: PrismaScores;
}

interface PrismaRadarChartProps {
  current: PrismaSeries;
  comparison?: PrismaSeries | undefined;
  className?: string;
  // Versão reduzida para o dashboard: card com título dentro e radar menor.
  compact?: boolean;
  pdfLayout?: boolean;
}

interface TickProps {
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  payload?: { value?: Prisma };
}

const chartConfig = {
  current: {
    label: 'dashboardPrisma:periodoAtual',
    color: 'var(--chart-1)',
  },
  comparison: {
    label: 'dashboardPrisma:periodoComparado',
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
function compactMargin(names: string[], withComparison: boolean) {
  const valueWidth = textWidth(
    withComparison ? '100 / 100' : '100',
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

function radarPoints(values: readonly number[]) {
  const centerX = 130;
  const centerY = 128;
  const radius = 55;

  return values
    .map((value, index) => {
      const angle = (index / PRISMAS.length) * Math.PI * 2 - Math.PI / 2;
      const distance = (Math.max(0, Math.min(value, 100)) / 100) * radius;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      return `${String(x)},${String(y)}`;
    })
    .join(' ');
}

// O traço que identifica a série: contínuo para o resultado exibido,
// tracejado para a comparação.
function LegendSwatch({ series }: { series: 'current' | 'comparison' }) {
  return (
    <span
      aria-hidden="true"
      className={
        series === 'current'
          ? 'w-5 border-t-[3px]'
          : 'w-5 border-t-2 border-dashed'
      }
      style={{ borderColor: chartConfig[series].color }}
    />
  );
}

function PeriodLegend({
  current,
  comparison,
}: {
  current: PrismaSeries;
  comparison: PrismaSeries | undefined;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <ShownChip swatch={<LegendSwatch series="current" />}>
        {current.label}
      </ShownChip>
      {comparison && (
        <ShownChip swatch={<LegendSwatch series="comparison" />}>
          {comparison.label}
        </ShownChip>
      )}
    </div>
  );
}

function RadarMetricTick({
  tick,
  current,
  comparison,
  compact,
}: {
  tick: TickProps;
  current: PrismaScores;
  comparison: PrismaScores | undefined;
  compact: boolean;
}) {
  const { t } = useTranslation(['dashboardPrisma']);
  const prisma = tick.payload?.value;
  if (!prisma) return null;

  const x = tick.x ?? 0;
  const y = tick.y ?? 0;
  const centerX = tick.cx ?? 0;
  const centerY = tick.cy ?? 0;
  const anchor = x > centerX + 8 ? 'start' : x < centerX - 8 ? 'end' : 'middle';
  const comparisonValue = comparison?.[prisma];

  if (compact) {
    const lines = splitName(t(`dashboardPrisma:prismas.${prisma}`));
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
          {String(current[prisma])}
          {comparisonValue !== undefined && (
            <tspan fill={chartConfig.comparison.color}>
              {` / ${String(comparisonValue)}`}
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
        {t(`dashboardPrisma:prismas.${prisma}`)}
      </tspan>
      <tspan
        x={x}
        dy="15"
        fill={chartConfig.current.color}
        fontSize="12"
        fontWeight="700"
      >
        {String(current[prisma])}
      </tspan>
      {comparisonValue !== undefined && (
        <>
          <tspan dx="4" fill="var(--muted-foreground)" fontSize="11">
            /
          </tspan>
          <tspan
            dx="4"
            fill={chartConfig.comparison.color}
            fontSize="12"
            fontWeight="700"
          >
            {String(comparisonValue)}
          </tspan>
        </>
      )}
    </text>
  );
}

export function PrismaRadarChart({
  current,
  comparison,
  className,
  compact = false,
  pdfLayout = false,
}: PrismaRadarChartProps) {
  const { t } = useTranslation(['dashboardPrisma', 'dashboard']);
  const chartData = PRISMAS.map((prisma) => ({
    prisma,
    current: current.scores[prisma],
    comparison: comparison?.scores[prisma],
  }));
  const label = comparison
    ? t('dashboardPrisma:descricaoComComparacao', {
        atual: current.label,
        comparado: comparison.label,
      })
    : t('dashboardPrisma:descricaoSemComparacao', { atual: current.label });
  const names = PRISMAS.map((prisma) => t(`dashboardPrisma:prismas.${prisma}`));

  // O gráfico com a legenda: o mesmo nos dois modos; muda só a moldura.
  const plot = (
    <>
      {/* Na versão compacta título e legenda ficam dentro do card, como no
            Figma. */}
      {compact && (
        <>
          <div className="flex items-center gap-1.5">
            <h3 className={cardTitleClassName}>
              {t('dashboardPrisma:titulo')}
            </h3>
            <InfoTip
              title={t('dashboardPrisma:titulo')}
              text={t('dashboard:info.prisma')}
            />
          </div>
          <div className="mt-3">
            <PeriodLegend current={current} comparison={comparison} />
          </div>
        </>
      )}

      {pdfLayout ? (
        <svg
          className="pdf-prisma-radar"
          viewBox="0 0 260 250"
          role="img"
          aria-label={label}
        >
          {Array.from({ length: 5 }, (_, index) => {
            const radius = ((index + 1) / 5) * 55;
            const points = radarPoints(PRISMAS.map(() => (radius / 55) * 100));
            return (
              <polygon
                key={radius}
                points={points}
                fill="none"
                stroke="var(--border)"
                strokeWidth="1"
              />
            );
          })}
          {PRISMAS.map((prisma, index) => {
            const angle = (index / PRISMAS.length) * Math.PI * 2 - Math.PI / 2;
            const axisX = 130 + Math.cos(angle) * 55;
            const axisY = 128 + Math.sin(angle) * 55;
            return (
              <g key={prisma}>
                <line
                  x1="130"
                  y1="128"
                  x2={axisX}
                  y2={axisY}
                  stroke="var(--border)"
                  strokeWidth="1"
                />
              </g>
            );
          })}
          {PRISMAS.map((prisma, index) => {
            const nameLines = splitName(t(`dashboardPrisma:prismas.${prisma}`));
            const axisLabels = [
              { x: 130, y: 14, anchor: 'middle' },
              { x: 190, y: 98, anchor: 'start' },
              { x: 163, y: 201, anchor: 'middle' },
              { x: 97, y: 201, anchor: 'middle' },
              { x: 70, y: 98, anchor: 'end' },
            ] as const;
            const axisLabel = axisLabels[index];
            if (!axisLabel) return null;
            const { x, y, anchor } = axisLabel;

            return (
              <text
                key={prisma}
                className="pdf-prisma-axis-label"
                x={x}
                y={y}
                textAnchor={anchor}
              >
                {nameLines.map((line, lineIndex) => (
                  <tspan key={line} x={x} dy={lineIndex === 0 ? 0 : 11}>
                    {line}
                  </tspan>
                ))}
                <tspan className="pdf-prisma-axis-value" x={x} dy="13">
                  {current.scores[prisma]}
                  {comparison && <> / {comparison.scores[prisma]}</>}
                </tspan>
              </text>
            );
          })}
          {comparison && (
            <polygon
              points={radarPoints(
                PRISMAS.map((prisma) => comparison.scores[prisma]),
              )}
              fill="var(--chart-2)"
              fillOpacity="0.1"
              stroke="var(--chart-2)"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
          )}
          <polygon
            points={radarPoints(
              PRISMAS.map((prisma) => current.scores[prisma]),
            )}
            fill="var(--chart-1)"
            fillOpacity="0.18"
            stroke="var(--chart-1)"
            strokeWidth="2"
          />
        </svg>
      ) : (
        /* Na versão compacta o radar ocupa a altura que sobra no card, com
           300px de piso para quando o card estiver sozinho (celular). */
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
                ? compactMargin(names, comparison !== undefined)
                : { top: 20, right: 32, bottom: 20, left: 32 }
            }
          >
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="prisma"
              tick={(tick) => (
                <RadarMetricTick
                  tick={tick as TickProps}
                  current={current.scores}
                  comparison={comparison?.scores}
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
                      {t(`dashboardPrisma:prismas.${point.prisma}`)}
                    </p>
                    <p style={{ color: chartConfig.current.color }}>
                      {current.label}: {String(point.current)}
                    </p>
                    {comparison !== undefined && (
                      <p style={{ color: chartConfig.comparison.color }}>
                        {comparison.label}: {String(point.comparison)}
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
            {comparison && (
              <Radar
                name={comparison.label}
                dataKey="comparison"
                stroke="var(--color-comparison)"
                fill="var(--color-comparison)"
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="5 4"
                isAnimationActive={false}
              />
            )}
          </RadarChart>
        </ChartContainer>
      )}
    </>
  );

  return (
    <figure className={compact ? `h-full ${className ?? ''}` : className}>
      {/* Título e legenda: só na versão completa */}
      {!compact && (
        <>
          <figcaption className="mb-3">
            <h2 className={sectionTitleClassName}>
              {t('dashboardPrisma:titulo')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </figcaption>

          <div className="mb-3">
            <PeriodLegend current={current} comparison={comparison} />
          </div>
        </>
      )}

      {compact ? (
        <Card className="h-full">
          <CardContent className="flex flex-1 flex-col">{plot}</CardContent>
        </Card>
      ) : (
        <div
          className="rounded-lg border border-border bg-card px-2 py-3 shadow-sm sm:px-5 sm:py-4"
          style={{ backgroundColor: 'var(--card)' }}
        >
          {plot}
        </div>
      )}

      {/* O sr-only fica num div em volta, e não na tabela: o navegador desenha
          o <caption> fora da caixa da tabela, e ele aparecia embaixo do card. */}
      <div className="sr-only">
        <table>
          <caption>{label}</caption>
          <thead>
            <tr>
              <th>{t('dashboardPrisma:prisma')}</th>
              <th>{current.label}</th>
              {comparison && <th>{comparison.label}</th>}
            </tr>
          </thead>
          <tbody>
            {PRISMAS.map((prisma) => (
              <tr key={prisma}>
                <th>{t(`dashboardPrisma:prismas.${prisma}`)}</th>
                <td>{String(current.scores[prisma])}</td>
                {comparison && <td>{String(comparison.scores[prisma])}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
