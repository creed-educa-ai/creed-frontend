import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  ComparisonOptions,
  ComparisonScope,
  DepartmentRow,
  PrismaComparison,
  TeamAlignment,
} from '@/features/dashboards/dashboardsApi';
import { cn } from '@/lib/utils';
import type { DepartmentType } from '@/types/api';
import type { DimensionScores } from '@/features/dashboards/prismas';
import { AlignmentCard } from './AlignmentCard';
import { DepartmentDot } from '@/components/department/DepartmentTag';
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
  // Nome da opção "empresa toda" na comparação por setor.
  organizationName: string;
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
  organizationName,
  comparisonOptions,
  comparisons,
  alignment,
  departmentMatrix,
}: OverviewSectionProps) {
  const { t } = useTranslation([
    'resultado',
    'dashboard',
    'dashboardPrisma',
    'comum',
  ]);
  // Começa no período anterior ao exibido, no mesmo recorte; os dois nulos
  // são "sem comparação". Todos os cards da seção mostram a mesma comparação,
  // por isso a escolha mora aqui, e os botões ficam no cabeçalho da seção.
  const [comparedPeriod, setComparedPeriod] = useState<string | null>(
    comparisonOptions.default_period,
  );
  const [comparedScope, setComparedScope] = useState<ComparisonScope | null>(
    null,
  );

  // No contrato, o período exibido na comparação é nulo ("o mesmo"); no
  // botão, ele aparece pelo nome. Com um setor e nenhum período marcado, o
  // botão mostra o período exibido, que é o que a comparação usa.
  const contractPeriod = comparedPeriod === period ? null : comparedPeriod;
  const shownComparedPeriod =
    comparedPeriod ?? (comparedScope === null ? null : period);
  const selected = comparisons.find(
    (comparison) =>
      comparison.period === contractPeriod &&
      comparison.scope === comparedScope,
  );
  const departmentName = (department: DepartmentType) =>
    t(`comum:setores.${department}`);
  const scopeName = (scope: ComparisonScope) =>
    scope === 'organization' ? organizationName : departmentName(scope);
  // "Marketing 2026/1", ou só "2026/1" na organização inteira.
  const seriesLabel = (name: string | null, seriesPeriod: string) =>
    name ? `${name} ${seriesPeriod}` : seriesPeriod;
  const shownLabel = seriesLabel(viewLabel, period);
  // O que a comparação deixa nulo é o mesmo do que está sendo exibido. O
  // objeto serve aos três cards: cada um usa a parte dele.
  const compared = selected && {
    label: seriesLabel(
      selected.scope ? scopeName(selected.scope) : viewLabel,
      selected.period ?? period,
    ),
    scores: selected.scores,
    variation: selected.variation,
    dimensions: selected.dimensions,
  };

  const clear = () => {
    setComparedPeriod(null);
    setComparedScope(null);
  };

  return (
    <CollapsibleSection
      title={t('resultado:metricas')}
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
            options={comparisonOptions.periods.map((option) => ({
              id: option,
              label: option,
              // Sem setor, o período exibido seria o recorte contra ele mesmo.
              disabled: option === period && comparedScope === null,
            }))}
            value={shownComparedPeriod}
            onChange={setComparedPeriod}
            onClear={clear}
          />
          {comparisonOptions.departments.length > 0 && (
            <ComparisonFilter
              placeholder={t('dashboard:Setor')}
              // A empresa toda primeiro: compara o recorte com a média de
              // todos, ou tira o setor da comparação sem limpar o período.
              options={[
                {
                  id: 'organization' as const,
                  label: scopeName('organization'),
                },
                ...comparisonOptions.departments.map((department) => ({
                  id: department,
                  label: departmentName(department),
                  icon: <DepartmentDot department={department} />,
                })),
              ]}
              value={comparedScope}
              onChange={setComparedScope}
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

      {/* Alinhamento | Setores × prismas, lado a lado no desktop: o
          alinhamento fica estreito (as barras leem bem assim) e a tabela com
          o resto. Sem alinhamento (recorte de funcionário), a tabela ocupa a
          linha. Nenhum dos dois segue a comparação. */}
      {(alignment ?? departmentMatrix) && (
        <div
          className={cn(
            'mt-4 grid grid-cols-1 gap-4',
            alignment && departmentMatrix && 'xl:grid-cols-[2fr_3fr]',
          )}
        >
          {alignment && (
            <AlignmentCard alignment={alignment} shownLabel={shownLabel} />
          )}
          {departmentMatrix && (
            <DepartmentMatrixCard rows={departmentMatrix} period={period} />
          )}
        </div>
      )}
    </CollapsibleSection>
  );
}
