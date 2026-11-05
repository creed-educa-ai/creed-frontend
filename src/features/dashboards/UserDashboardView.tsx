import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/ui/sonner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/pageHeader';
import { pageGutterClassName } from '@/lib/layout';
import { Skeleton } from '@/components/ui/skeleton';
import { loadUserDashboard } from '@/features/dashboards/dashboardsSlice';
import { screenEnterClassName } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { DashboardToolbar } from './components/DashboardToolbar';
import { OverviewSection } from './components/OverviewSection';
import { PeriodFilter } from './components/PeriodFilter';
import { ResultText } from './components/ResultText';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { dashboardsApi, type UserDashboard } from './dashboardsApi';
import { DashboardPdfReport } from './components/DashboardPdfReport';

// Dashboard individual: o resultado de quem está logado.
export function UserDashboardView() {
  const { t } = useTranslation(['comum', 'dashboard']);
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector(
    (state) => state.dashboards.user,
  );
  // Nulo até a pessoa escolher: vale o período atual que veio do back.
  const [period, setPeriod] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<UserDashboard | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const exportPdf = useCallback(async () => {
    if (!data || exportingPdf) return;
    setExportingPdf(true);
    try {
      const latestPeriod = data.periods[0];
      const report = await dashboardsApi.getUserDashboard({
        period: latestPeriod,
      });
      setPdfData(report);
    } catch {
      setExportingPdf(false);
      toast.error(t('dashboard:erroAoExportarPdf'));
    }
  }, [data, exportingPdf, t]);

  const finishPdfExport = useCallback(() => {
    setPdfData(null);
    setExportingPdf(false);
  }, []);

  const failPdfExport = useCallback(() => {
    setPdfData(null);
    setExportingPdf(false);
    toast.error(t('dashboard:erroAoExportarPdf'));
  }, [t]);

  // Cada troca de período pede ao back o resultado daquele período.
  useEffect(() => {
    void dispatch(loadUserDashboard({ period: period ?? undefined }));
  }, [dispatch, period]);

  return (
    <div className="dashboard-view flex min-h-svh flex-col overflow-hidden bg-background">
      <PageHeader
        eyebrow={data?.organization_name ?? ''}
        title={t('dashboard:titulo')}
      />

      <main
        className={cn(
          'flex flex-col gap-8 pb-10',
          pageGutterClassName,
          screenEnterClassName,
        )}
      >
        {/* Esqueleto só na primeira carga: ao trocar o período, a tela fica
            com o dado anterior até o novo chegar. */}
        {status === 'loading' && !data && (
          <LoadingState>
            <Skeleton className="h-80 w-full rounded-2xl" />
          </LoadingState>
        )}

        {status === 'error' && <ErrorState message={error && t(error)} />}

        {data && (
          <>
            <DashboardToolbar
              onExportPdf={() => {
                void exportPdf();
              }}
              exportingPdf={exportingPdf}
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
      {pdfData && (
        <DashboardPdfReport
          kind="user"
          data={pdfData}
          onAfterPrint={finishPdfExport}
          onPrintError={failPdfExport}
        />
      )}
    </div>
  );
}
