import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/pageHeader';
import { pageGutterClassName } from '@/lib/layout';
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
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { dashboardsApi, type CompanyDashboard } from './dashboardsApi';
import { DashboardPdfReport } from './components/DashboardPdfReport';
import { periodLabeler } from './periods';

interface CompanyDashboardViewProps {
  // A administradora escolhe a organização (a dela é a CREED); a gestora não
  // passa nada: vale o vínculo dela.
  organizationId?: string | undefined;
  // O seletor da administradora, antes dos outros filtros. Aparece mesmo sem
  // dado, para ela poder trocar de empresa quando uma não tem resultado.
  extraFilters?: ReactNode;
}

// Dashboard da organização: resultado agregado, com recorte por setor ou membro.
export function CompanyDashboardView({
  organizationId,
  extraFilters,
}: CompanyDashboardViewProps = {}) {
  const { t, i18n } = useTranslation(['comum', 'dashboard']);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data, status, error } = useAppSelector(
    (state) => state.dashboards.company,
  );
  // O vínculo de quem está logado: entre as pessoas do filtro, é o próprio
  // resultado (a gestora só recebe ele; a administradora, todas as outras). Ele
  // abre o dashboard individual, como o de qualquer funcionário.
  const linkId = useAppSelector(
    (state) => state.authentication.user?.link_id ?? null,
  );
  const ownResult = data?.members.find((member) => member.id === linkId);
  const otherMembers =
    data?.members.filter((member) => member.id !== linkId) ?? [];
  // Nulo até a pessoa escolher: vale o período mais recente, que o back
  // resolve. O recorte começa na organização inteira.
  const [period, setPeriod] = useState<string | null>(null);
  const [view, setView] = useState<DashboardView>({});
  const [pdfData, setPdfData] = useState<CompanyDashboard | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  // O que vem de fora (a administradora): a organização. Vem antes do recorte
  // escolhido aqui.
  const fixedFilters = useMemo(
    () => ({ organization_id: organizationId }),
    [organizationId],
  );
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
      const report = await dashboardsApi.getCompanyDashboard({
        ...fixedFilters,
        period: latestPeriod?.id,
        ...view,
      });
      setPdfData(report);
    } catch {
      setExportingPdf(false);
      toast.error(t('dashboard:erroAoExportarPdf'));
    }
  }, [data, exportingPdf, t, view, fixedFilters]);

  const finishPdfExport = useCallback(() => {
    setPdfData(null);
    setExportingPdf(false);
  }, []);

  const failPdfExport = useCallback(() => {
    setPdfData(null);
    setExportingPdf(false);
    toast.error(t('dashboard:erroAoExportarPdf'));
  }, [t]);

  // Cada troca de filtro pede ao back o recorte novo, e cancela o pedido
  // anterior: trocando rápido, só o último recorte chega à tela.
  useEffect(() => {
    const carga = dispatch(
      loadCompanyDashboard({
        ...fixedFilters,
        period: period ?? undefined,
        ...view,
      }),
    );
    return () => {
      carga.abort();
    };
  }, [dispatch, period, view, fixedFilters]);

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
        {/* Esqueleto só na primeira carga: ao trocar o filtro, a tela fica
            com o dado anterior até o novo chegar. */}
        {/* Sem dado ainda (carregando, ou empresa sem resultado), o seletor da
            administradora continua à mão. */}
        {!data && extraFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {extraFilters}
          </div>
        )}

        {status === 'loading' && !data && (
          <LoadingState>
            <Skeleton className="h-80 w-full rounded-2xl" />
          </LoadingState>
        )}

        {/* Sem resultado ainda não é erro: é a organização sem resposta. */}
        {status === 'error' && error === 'dashboard:semResultadoEmpresa' && (
          <EmptyState>{t('dashboard:semResultadoEmpresa')}</EmptyState>
        )}

        {status === 'error' && error !== 'dashboard:semResultadoEmpresa' && (
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
                  <CompanyViewFilter
                    departments={data.departments.map((department) => ({
                      id: department,
                      label: t(`comum:setores.${department}`),
                    }))}
                    ownResult={ownResult}
                    onOpenOwnResult={() => {
                      navigate('/dashboard');
                    }}
                    members={otherMembers}
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
              periodLabel={periodLabel}
              viewScope={
                data.department ?? (data.member_id ? null : 'organization')
              }
              alignment={data.alignment}
              departmentMatrix={data.department_matrix}
            />

            <ResultText empresa {...data.creed_summary} />
          </>
        )}
      </main>
      {pdfData && (
        <DashboardPdfReport
          kind="company"
          data={pdfData}
          onAfterPrint={finishPdfExport}
          onPrintError={failPdfExport}
        />
      )}
    </div>
  );
}
