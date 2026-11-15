import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  ComparisonOptions,
  ComparisonScope,
  DepartmentRow,
  OverviewGroup,
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
  // O rótulo de um período pelo id (a data final, `periodLabeler`). Sem ela, o
  // id aparece como veio.
  periodLabel?: ((period: string) => string) | undefined;
  // O escopo que é o próprio recorte exibido: `organization` na organização
  // inteira, o setor no recorte de um setor, nulo no de uma pessoa (e no
  // dashboard individual). Comparar com ele só faz sentido em outro período.
  viewScope?: ComparisonScope | null;
  // Só a visão da empresa manda; nulo no recorte de um funcionário.
  alignment?: TeamAlignment | null | undefined;
  // Também só da empresa; não depende do recorte, só do período.
  departmentMatrix?: DepartmentRow[] | undefined;
  // O retrato atual da administradora: no lugar dos setores, as empresas (ou os
  // mentorandos), na comparação e no mapa. Sem períodos, o botão de período
  // some.
  scopeOptions?: { id: string; label: string }[] | undefined;
  scopePlaceholder?: string | undefined;
  groupMatrix?:
    { title: string; heading: string; rows: OverviewGroup[] } | undefined;
  pdfLayout?: boolean;
}

export function OverviewSection({
  period,
  viewLabel,
  scores,
  dimensions,
  organizationName,
  comparisonOptions,
  comparisons,
  periodLabel = (id) => id,
  viewScope = null,
  alignment,
  departmentMatrix,
  scopeOptions,
  scopePlaceholder,
  groupMatrix,
  pdfLayout = false,
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
  // Um setor, `organization`, ou (no retrato atual) o id de um grupo.
  const [comparedScope, setComparedScope] = useState<string | null>(null);

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
  const scopeName = (scope: string) => {
    const option = scopeOptions?.find(({ id }) => id === scope);
    if (option) return option.label;
    return scope === 'organization'
      ? organizationName
      : departmentName(scope as DepartmentType);
  };
  // "Marketing 2026/1", ou só "2026/1" na organização inteira. Sem período (o
  // retrato atual), só o nome.
  const seriesLabel = (name: string | null, seriesPeriod: string) =>
    [name, seriesPeriod && periodLabel(seriesPeriod)].filter(Boolean).join(' ');
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

  // Escolher um setor (ou a empresa toda) quando ainda não havia setor marcado
  // compara no período exibido: "comparar com Financeiro" é Financeiro agora,
  // não no período anterior que estava marcado por padrão. Trocando de um
  // setor para outro, o período escolhido fica.
  const chooseScope = (scope: string | null) => {
    if (scope !== null && scope === viewScope) {
      // O próprio recorte: no período exibido seria ele contra ele mesmo,
      // então a comparação fica (ou volta) no período anterior.
      if (comparedPeriod === null || comparedPeriod === period) {
        setComparedPeriod(comparisonOptions.default_period);
      }
    } else if (scope !== null && comparedScope === null) {
      setComparedPeriod(period);
    }
    setComparedScope(scope);
  };

  const clear = () => {
    setComparedPeriod(null);
    setComparedScope(null);
  };

  return (
    <CollapsibleSection
      title={t('resultado:metricas')}
      collapsible={!pdfLayout}
      action={
        !pdfLayout && (
          <div
            role="group"
            aria-label={t('dashboardPrisma:compararCom')}
            className="flex flex-wrap items-center gap-2"
          >
            {/* No celular: o rótulo numa linha e os dois botões dividindo a de
              baixo. De sm para cima, os três na linha do título. */}
            <span
              className="basis-full text-sm text-muted-foreground sm:basis-auto"
              aria-hidden="true"
            >
              {t('dashboardPrisma:compararCom')}
            </span>
            {comparisonOptions.periods.length > 0 && (
              <ComparisonFilter
                placeholder={t('dashboard:Periodo')}
                options={comparisonOptions.periods.map((option) => ({
                  id: option,
                  label: periodLabel(option),
                  // Sem setor, o período exibido seria o recorte contra ele mesmo.
                  disabled: option === period && comparedScope === null,
                }))}
                value={shownComparedPeriod}
                onChange={setComparedPeriod}
                onClear={clear}
                className="min-w-0 flex-1 sm:flex-none"
              />
            )}
            {scopeOptions && scopeOptions.length > 0 && (
              <ComparisonFilter
                placeholder={scopePlaceholder ?? t('dashboard:Setor')}
                options={scopeOptions}
                value={comparedScope}
                onChange={chooseScope}
                onClear={clear}
                className="min-w-0 flex-1 sm:flex-none"
              />
            )}
            {!scopeOptions && comparisonOptions.departments.length > 0 && (
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
                onChange={chooseScope}
                onClear={clear}
                className="min-w-0 flex-1 sm:flex-none"
              />
            )}
          </div>
        )
      }
    >
      {/* Variação | Prisma | Dimensões. No desktop os três dividem a linha;
          no tablet as dimensões descem e ocupam a linha toda; no celular,
          um embaixo do outro. */}
      <div
        className={cn(
          'grid grid-cols-1 gap-4 md:grid-cols-[minmax(16rem,1fr)_2fr] xl:grid-cols-[minmax(16rem,1fr)_1.4fr_1.4fr]',
          pdfLayout && 'pdf-dashboard-metrics',
        )}
      >
        <VariationCard
          scores={scores}
          shownLabel={shownLabel}
          comparison={compared}
        />
        <PrismaRadarChart
          current={{ label: shownLabel, scores }}
          comparison={compared}
          compact
          pdfLayout={pdfLayout}
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
      {(alignment ?? departmentMatrix ?? groupMatrix) && (
        <div
          className={cn(
            'mt-4 grid grid-cols-1 gap-4',
            alignment &&
              (departmentMatrix ?? groupMatrix) &&
              'xl:grid-cols-[2fr_3fr]',
            pdfLayout &&
              alignment &&
              departmentMatrix &&
              'pdf-dashboard-supporting',
          )}
        >
          {alignment && (
            <AlignmentCard alignment={alignment} shownLabel={shownLabel} />
          )}
          {departmentMatrix && (
            <DepartmentMatrixCard
              rows={departmentMatrix}
              period={periodLabel(period)}
            />
          )}
          {groupMatrix && (
            <DepartmentMatrixCard
              rows={groupMatrix.rows}
              period={shownLabel}
              title={groupMatrix.title}
              heading={groupMatrix.heading}
            />
          )}
        </div>
      )}
    </CollapsibleSection>
  );
}
