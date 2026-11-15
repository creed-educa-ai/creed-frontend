import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { dashboardsApi, type UserDashboard } from './dashboardsApi';
import { DashboardPdfReport } from './components/DashboardPdfReport';
import { periodLabeler } from './periods';

interface UserDashboardViewProps {
  // O mentorando que a administradora abriu. Sem ele, o resultado de quem está
  // logado.
  memberId?: string | undefined;
  // O seletor da administradora, antes do período. Aparece mesmo sem dado,
  // para ela poder trocar de mentorando.
  extraFilters?: ReactNode;
}

// Dashboard individual: o resultado de quem está logado, ou de um mentorando
// visto pela administradora.
export function UserDashboardView({
  memberId,
  extraFilters,
}: UserDashboardViewProps = {}) {
  const { t, i18n } = useTranslation(['comum', 'dashboard']);
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector(
    (state) => state.dashboards.user,
  );
  // A gestora chega aqui pelo próprio nome, no dashboard da empresa: o caminho
  // de volta fica à mão.
  const isManager = useAppSelector(
    (state) => state.authentication.user?.role === 'gestor',
  );
  // Nulo até a pessoa escolher: vale o período atual que veio do back.
  const [period, setPeriod] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<UserDashboard | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  // O rótulo de cada período é a data final, no formato do idioma da tela.
  const periodLabel = useMemo(
    () => periodLabeler(data?.periods ?? [], i18n.language),
    [data?.periods, i18n.language],
  );

  const exportPdf = useCallback(async () => {
    if (!data || exportingPdf) return;
    setExportingPdf(true);
    try {
      const latestPeriod = data.periods[0];
      const report = await dashboardsApi.getUserDashboard({
        period: latestPeriod?.id,
        member_id: memberId,
      });
      setPdfData(report);
    } catch {
      setExportingPdf(false);
      toast.error(t('dashboard:erroAoExportarPdf'));
    }
  }, [data, exportingPdf, t, memberId]);

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
    void dispatch(
      loadUserDashboard({ period: period ?? undefined, member_id: memberId }),
    );
  }, [dispatch, period, memberId]);

  return (
    <div className="dashboard-view flex min-h-svh flex-col overflow-hidden bg-background">
      <PageHeader
        eyebrow={data?.member_name ?? data?.organization_name ?? ''}
        title={t('dashboard:titulo')}
      />

      <main
        className={cn(
          'flex flex-col gap-8 pb-10',
          pageGutterClassName,
          screenEnterClassName,
        )}
      >
        {isManager && (
          <Button asChild variant="ghost" className="self-start">
            <Link to="/dashboard/company">
              <ChevronLeft aria-hidden="true" />
              {t('dashboard:voltarParaEmpresa')}
            </Link>
          </Button>
        )}

        {/* Sem dado ainda (carregando, ou mentorando sem resultado), o seletor
            da administradora continua à mão. */}
        {!data && extraFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {extraFilters}
          </div>
        )}

        {/* Esqueleto só na primeira carga: ao trocar o período, a tela fica
            com o dado anterior até o novo chegar. */}
        {status === 'loading' && !data && (
          <LoadingState>
            <Skeleton className="h-80 w-full rounded-2xl" />
          </LoadingState>
        )}

        {/* Quem ainda não respondeu nada não tem o que ver: não é erro. */}
        {status === 'error' && error === 'dashboard:semResultado' && (
          <div className="flex flex-col items-center gap-4">
            <EmptyState>
              {memberId
                ? t('dashboard:semResultadoMentorando')
                : t('dashboard:semResultado')}
            </EmptyState>
            {/* O questionário é de quem está logado, não do mentorando. */}
            {!memberId && (
              <Button asChild>
                <Link to="/questionnaire">
                  {t('dashboard:irParaQuestionario')}
                </Link>
              </Button>
            )}
          </div>
        )}

        {status === 'error' && error !== 'dashboard:semResultado' && (
          <ErrorState message={error && t(error)} />
        )}

        {data && (
          <>
            <DashboardToolbar
              onExportPdf={() => {
                void exportPdf();
              }}
              exportingPdf={exportingPdf}
              filters={
                <>
                  {extraFilters}
                  <PeriodFilter
                    periods={data.periods.map((option) => ({
                      id: option.id,
                      label: periodLabel(option.id),
                    }))}
                    value={period ?? data.period}
                    onChange={setPeriod}
                  />
                </>
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
              periodLabel={periodLabel}
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
