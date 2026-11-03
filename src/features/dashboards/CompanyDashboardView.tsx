import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/pageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { loadCompanyDashboard } from '@/features/dashboards/dashboardsSlice';
import { screenEnterClassName } from '@/lib/animations';
import { cn } from '@/lib/utils';
import type { DepartmentType } from '@/types/api';
import {
  CompanyViewFilter,
  type DashboardView,
} from './components/CompanyViewFilter';
import { DashboardToolbar } from './components/DashboardToolbar';
import { OverviewSection } from './components/OverviewSection';
import { PeriodFilter } from './components/PeriodFilter';
import { ResultText } from './components/ResultText';
import { SummaryCards } from './components/SummaryCards';

// Dashboard da organização: resultado agregado, com recorte por setor ou membro.
export function CompanyDashboardView() {
  const { t } = useTranslation(['comum', 'dashboard']);
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector(
    (state) => state.dashboards.company,
  );
  // Nulo até a pessoa escolher: vale o período mais recente, que o back
  // resolve. O recorte começa na organização inteira.
  const [period, setPeriod] = useState<string | null>(null);
  const [view, setView] = useState<DashboardView>({});

  // Cada troca de filtro pede ao back o recorte novo.
  useEffect(() => {
    void dispatch(
      loadCompanyDashboard({ period: period ?? undefined, ...view }),
    );
  }, [dispatch, period, view]);

  // Nome do setor ou do membro; nulo na organização inteira. Serve ao filtro
  // escolhido e ao recorte que a resposta do back diz mostrar.
  const viewName = (selected: {
    department?: DepartmentType | null | undefined;
    member_id?: string | null | undefined;
  }) => {
    if (selected.department) return t(`comum:setores.${selected.department}`);
    if (selected.member_id)
      return (
        data?.members.find((member) => member.id === selected.member_id)
          ?.label ?? null
      );
    return null;
  };

  return (
    <div className="flex min-h-svh flex-col overflow-hidden bg-background">
      <PageHeader
        eyebrow={data?.organization_name ?? ''}
        title={t('dashboard:titulo')}
      />

      <main
        className={cn('flex flex-col gap-8 px-6 pb-10', screenEnterClassName)}
      >
        {/* Esqueleto só na primeira carga: ao trocar o filtro, a tela fica
            com o dado anterior até o novo chegar. */}
        {status === 'loading' && !data && (
          <div className="space-y-3" aria-live="polite">
            <p className="text-sm text-muted-foreground">{t('carregando')}</p>
            <Skeleton className="h-80 w-full rounded-3xl" />
          </div>
        )}

        {status === 'error' && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive"
          >
            {error && t(error)} {t('tenteRecarregar')}
          </p>
        )}

        {data && (
          <>
            <DashboardToolbar
              filters={
                <>
                  <PeriodFilter
                    periods={data.periods}
                    value={period ?? data.period}
                    onChange={setPeriod}
                  />
                  <CompanyViewFilter
                    departments={data.departments.map((department) => ({
                      id: department,
                      label: t(`comum:setores.${department}`),
                    }))}
                    members={data.members}
                    value={view}
                    label={viewName(view) ?? data.organization_name}
                    organizationName={data.organization_name}
                    onChange={setView}
                  />
                </>
              }
            />

            <SummaryCards
              // "Resumo de Marketing": o resumo é do recorte escolhido.
              nomeEmpresa={viewName(data) ?? data.organization_name}
              {...data.company_summary}
            />

            {/* A `key` recomeça a comparação quando o recorte muda: a escolha
                antiga pode nem existir mais (ex.: comparar com o próprio
                período exibido). */}
            <OverviewSection
              key={`${data.period}|${data.department ?? ''}|${data.member_id ?? ''}`}
              period={data.period}
              scores={data.scores}
              dimensions={data.dimensions}
              // Sem setor e sem funcionário, o recorte é a organização: o
              // nome dela entra no rótulo, como o do setor entraria.
              viewLabel={viewName(data) ?? data.organization_name}
              organizationName={data.organization_name}
              comparisonOptions={data.comparison_options}
              comparisons={data.comparisons}
              alignment={data.alignment}
              departmentMatrix={data.department_matrix}
            />

            <ResultText empresa {...data.creed_summary} />
          </>
        )}
      </main>
    </div>
  );
}
