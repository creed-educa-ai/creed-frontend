import { useTranslation } from 'react-i18next';
import { CollapsibleSection } from './CollapsibleSection';
import { MetricasCard } from './MetricasCard';
import {
  PRISMA_DIMENSIONS,
  PrismaRadarChart,
  type PrismaPeriod,
  type PrismaScores,
} from './PrismaRadarChart';

interface OverviewSectionProps {
  current: PrismaPeriod;
  previous: PrismaPeriod;
}

export function OverviewSection({ current, previous }: OverviewSectionProps) {
  const { t } = useTranslation(['dashboardPrisma', 'resultado']);

  // Transforma as notas do prisma na lista que o MetricasCard espera.
  const buildMetrics = (scores: PrismaScores) =>
    PRISMA_DIMENSIONS.map((dimension) => ({
      nome: t(`dashboardPrisma:dimensoes.${dimension}`),
      valor: scores[dimension],
    }));

  return (
    <CollapsibleSection title={t('resultado:dadosVisaoGeral')}>
      {/* Métricas | Prisma | Evolução. A lista de métricas fica com a largura
          do conteúdo e os dois radares dividem o resto. Abaixo de xl as
          métricas ocupam a linha toda e os radares ficam lado a lado embaixo. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[minmax(16rem,auto)_1fr_1fr]">
        <div className="md:col-span-2 xl:col-span-1">
          <MetricasCard metricas={buildMetrics(current.scores)} />
        </div>
        <PrismaRadarChart current={current} compact />
        <PrismaRadarChart
          current={current}
          previous={previous}
          title={t('resultado:evolucao')}
          compact
        />
      </div>
    </CollapsibleSection>
  );
}
