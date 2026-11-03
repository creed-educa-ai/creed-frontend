import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  ComparisonOptions,
  DepartmentRow,
  PrismaComparison,
  TeamAlignment,
} from '@/features/dashboards/dashboardsApi';
import type { DepartmentType } from '@/types/api';
import type { DimensionScores } from '@/features/dashboards/prismas';
import { AlignmentCard } from './AlignmentCard';
import { CollapsibleSection } from './CollapsibleSection';
import { ComparisonFilter } from './ComparisonFilter';
import { DepartmentMatrixCard } from './DepartmentMatrixCard';
import { DimensionsCard } from './DimensionsCard';
import { PrismaRadarChart, type PrismaScores } from './PrismaRadarChart';
import { VariationCard } from './VariationCard';

interface OverviewSectionProps {
  // O recorte exibido: período e, se houver, o nome do setor ou do membro.
  period: string;
  viewLabel: string | null;
  scores: PrismaScores;
  dimensions: DimensionScores;
  comparisonOptions: ComparisonOptions;
  comparisons: PrismaComparison[];
  // Só a visão da empresa manda; nulo no recorte de um funcionário.
  alignment?: TeamAlignment | null | undefined;
  // Também só da empresa; não depende do recorte, só do período.
  departmentMatrix?: DepartmentRow[] | undefined;
}

export function OverviewSection({
  period,
  viewLabel,
  scores,
  dimensions,
  comparisonOptions,
  comparisons,
  alignment,
  departmentMatrix,
}: OverviewSectionProps) {
  const { t } = useTranslation(['resultado', 'dashboard', 'dashboardPrisma']);
  // Começa no período anterior ao exibido, no mesmo recorte; os dois nulos
  // são "sem comparação". Todos os cards da seção mostram a mesma comparação,
  // por isso a escolha mora aqui, e os botões ficam no cabeçalho da seção.
  const [comparedPeriod, setComparedPeriod] = useState<string | null>(
    comparisonOptions.default_period,
  );
  const [comparedDepartment, setComparedDepartment] =
    useState<DepartmentType | null>(null);

  const selected = comparisons.find(
    (comparison) =>
      comparison.period === comparedPeriod &&
      comparison.department === comparedDepartment,
  );
  const departmentName = (department: DepartmentType) =>
    t(`dashboard:setores.${department}`);
  // "Marketing 2026/1", ou só "2026/1" na organização inteira.
  const seriesLabel = (name: string | null, seriesPeriod: string) =>
    name ? `${name} ${seriesPeriod}` : seriesPeriod;
  const shownLabel = seriesLabel(viewLabel, period);
  // O que a comparação deixa nulo é o mesmo do que está sendo exibido. O
  // objeto serve aos três cards: cada um usa a parte dele.
  const compared = selected && {
    label: seriesLabel(
      selected.department ? departmentName(selected.department) : viewLabel,
      selected.period ?? period,
    ),
    scores: selected.scores,
    variation: selected.variation,
    dimensions: selected.dimensions,
  };

  const clear = () => {
    setComparedPeriod(null);
    setComparedDepartment(null);
  };

  return (
    <CollapsibleSection
      title={t('resultado:dadosVisaoGeral')}
      action={
        <div
          role="group"
          aria-label={t('dashboardPrisma:compararCom')}
          className="flex flex-wrap items-center gap-2"
        >
          <span className="text-sm text-muted-foreground" aria-hidden="true">
            {t('dashboardPrisma:compararCom')}
          </span>
          <ComparisonFilter
            placeholder={t('dashboard:Periodo')}
            options={comparisonOptions.periods.map((period) => ({
              id: period,
              label: period,
            }))}
            value={comparedPeriod}
            onChange={setComparedPeriod}
            onClear={clear}
          />
          {comparisonOptions.departments.length > 0 && (
            <ComparisonFilter
              placeholder={t('dashboard:Setor')}
              options={comparisonOptions.departments.map((department) => ({
                id: department,
                label: departmentName(department),
              }))}
              value={comparedDepartment}
              onChange={setComparedDepartment}
              onClear={clear}
            />
          )}
        </div>
      }
    >
      {/* Variação | Prisma | Dimensões. No desktop os três dividem a linha;
          no tablet as dimensões descem e ocupam a linha toda; no celular,
          um embaixo do outro. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(16rem,1fr)_2fr] xl:grid-cols-[minmax(16rem,1fr)_1.4fr_1.4fr]">
        <VariationCard
          scores={scores}
          shownLabel={shownLabel}
          comparison={compared}
        />
        <PrismaRadarChart
          current={{ label: shownLabel, scores }}
          comparison={compared}
          compact
        />
        <div className="md:col-span-2 xl:col-span-1">
          <DimensionsCard
            scores={dimensions}
            shownLabel={shownLabel}
            comparison={compared}
          />
        </div>
      </div>

      {/* Linha própria, larga: barras empilhadas leem melhor assim. Ainda não
          segue a comparação. */}
      {alignment && (
        <div className="mt-4">
          <AlignmentCard alignment={alignment} shownLabel={shownLabel} />
        </div>
      )}

      {departmentMatrix && (
        <div className="mt-4">
          <DepartmentMatrixCard rows={departmentMatrix} period={period} />
        </div>
      )}
    </CollapsibleSection>
  );
}
