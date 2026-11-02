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

  useEffect(() => {
    void dispatch(loadUserDashboard());
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
                <PeriodFilter
                  periods={data.periods}
                  value={period ?? data.current.label}
                  onChange={setPeriod}
                />
              }
            />

            <OverviewSection current={data.current} previous={data.previous} />

            <ResultText {...data.creed_summary} />
          </>
        )}
      </main>
    </div>
  );
}
