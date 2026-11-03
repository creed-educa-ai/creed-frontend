import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/pageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { loadUserDashboard } from '@/features/dashboards/dashboardsSlice';
import { screenEnterClassName } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { DashboardToolbar } from './components/DashboardToolbar';
import { OverviewSection } from './components/OverviewSection';
import { PeriodFilter } from './components/PeriodFilter';
import { ResultText } from './components/ResultText';

// Dashboard individual: o resultado de quem está logado.
export function UserDashboardView() {
  const { t } = useTranslation(['comum', 'dashboard']);
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector(
    (state) => state.dashboards.user,
  );
  // Nulo até a pessoa escolher: vale o período atual que veio do back.
  const [period, setPeriod] = useState<string | null>(null);

  // Cada troca de período pede ao back o resultado daquele período.
  useEffect(() => {
    void dispatch(loadUserDashboard({ period: period ?? undefined }));
  }, [dispatch, period]);

  return (
    <div className="flex min-h-svh flex-col overflow-hidden bg-background">
      <PageHeader
        eyebrow={data?.organization_name ?? ''}
        title={t('dashboard:titulo')}
      />

      <main
        className={cn('flex flex-col gap-8 px-6 pb-10', screenEnterClassName)}
      >
        {/* Esqueleto só na primeira carga: ao trocar o período, a tela fica
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
                <PeriodFilter
                  periods={data.periods}
                  value={period ?? data.period}
                  onChange={setPeriod}
                />
              }
            />

            {/* A `key` recomeça a comparação quando o período muda. */}
            <OverviewSection
              key={data.period}
              period={data.period}
              scores={data.scores}
              dimensions={data.dimensions}
              viewLabel={null}
              organizationName={data.organization_name}
              comparisonOptions={data.comparison_options}
              comparisons={data.comparisons}
            />

            <ResultText {...data.creed_summary} />
          </>
        )}
      </main>
    </div>
  );
}
