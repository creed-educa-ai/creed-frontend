import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/pageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { loadCompanyDashboard } from '@/features/dashboards/dashboardsSlice';
import { screenEnterClassName } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { CompanyViewFilter } from './components/CompanyViewFilter';
import { DashboardToolbar } from './components/DashboardToolbar';
import { OverviewSection } from './components/OverviewSection';
import { PeriodFilter } from './components/PeriodFilter';
import { ResultText } from './components/ResultText';
import { SummaryCards } from './components/SummaryCards';

// Dashboard da organização: resultado agregado, com recorte por grupo ou membro.
export function CompanyDashboardView() {
  const { t } = useTranslation(['comum', 'dashboard']);
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector(
    (state) => state.dashboards.company,
  );
  // Nulos até a pessoa escolher: valem o período atual e o primeiro grupo.
  const [period, setPeriod] = useState<string | null>(null);
  const [view, setView] = useState<string | null>(null);

  useEffect(() => {
    void dispatch(loadCompanyDashboard());
  }, [dispatch]);

  return (
    <div className="flex min-h-svh flex-col overflow-hidden bg-background">
      <PageHeader
        eyebrow={data?.organization_name ?? ''}
        title={t('dashboard:titulo')}
      />

      <main
        className={cn('flex flex-col gap-8 px-6 pb-10', screenEnterClassName)}
      >
        {status === 'loading' && (
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

        {status === 'ready' && data && (
          <>
            <DashboardToolbar
              filters={
                <>
                  <PeriodFilter
                    periods={data.periods}
                    value={period ?? data.current.label}
                    onChange={setPeriod}
                  />
                  <CompanyViewFilter
                    groups={data.groups.map((group) => ({
                      id: group.id,
                      label: t(group.labelKey),
                    }))}
                    members={data.members}
                    value={view ?? data.groups[0]?.id ?? ''}
                    onChange={setView}
                  />
                </>
              }
            />

            <SummaryCards
              nomeEmpresa={data.organization_name}
              {...data.company_summary}
            />

            <OverviewSection current={data.current} previous={data.previous} />

            <ResultText empresa {...data.creed_summary} />
          </>
        )}
      </main>
    </div>
  );
}
