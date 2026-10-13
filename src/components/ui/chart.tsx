import type { CSSProperties, ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export type ChartConfig = Record<string, { label: string; color: string }>;

interface ChartContainerProps {
  id: string;
  config: ChartConfig;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
  'aria-label'?: string;
}

export function ChartContainer({
  id,
  config,
  className,
  children,
  style,
  ...props
}: ChartContainerProps) {
  const chartColors = Object.fromEntries(
    Object.entries(config).map(([key, item]) => [`--color-${key}`, item.color]),
  ) as CSSProperties;

  return (
    <div
      data-slot="chart"
      data-chart={id}
      className={cn(
        'flex w-full justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-polar-grid-angle_line]:stroke-border [&_.recharts-polar-grid-concentric_polygon]:stroke-border [&_.recharts-radar-polygon]:outline-none [&_.recharts-surface]:outline-none',
        className,
      )}
      style={{ ...chartColors, ...style }}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
