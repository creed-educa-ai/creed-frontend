import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/pageHeader';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { Skeleton } from '@/components/ui/skeleton';
import { loadOverview } from '@/features/dashboards/dashboardsSlice';
import { screenEnterClassName } from '@/lib/animations';
import { pageGutterClassName } from '@/lib/layout';
import { cn } from '@/lib/utils';
import { CompanyDashboardView } from './CompanyDashboardView';
import { UserDashboardView } from './UserDashboardView';
import { AdminViewFilter, type AdminView } from './components/AdminViewFilter';
import { OverviewSection } from './components/OverviewSection';
import { ResultText } from './components/ResultText';
import { ShownChip } from './components/ShownChip';
import { SummaryCards } from './components/SummaryCards';
import type { OverviewKind } from './dashboardsApi';

// Sem comparação por período: o retrato atual não tem período.
const SEM_PERIODOS = { periods: [], departments: [], default_period: null };

// A visão fica na URL: o "Ver resultados" do painel abre uma empresa
// (`?organization_id=`) ou um mentorando (`?member_id=`), e recarregar a
// página mantém a escolha. Sem parâmetro, o retrato de todas as empresas.
function viewFromParams(params: URLSearchParams): AdminView {
  const organizationId = params.get('organization_id');
  if (organizationId) return { kind: 'company', id: organizationId };
  const memberId = params.get('member_id');
  if (memberId) return { kind: 'mentee', id: memberId };
  return params.get('view') === 'mentees'
    ? { kind: 'mentees' }
    : { kind: 'companies' };
}

function paramsFromView(view: AdminView): Record<string, string> {
  if (view.kind === 'company') return { organization_id: view.id };
  if (view.kind === 'mentee') return { member_id: view.id };
  return view.kind === 'mentees' ? { view: 'mentees' } : {};
}

// O dashboard da administradora. O padrão é o retrato atual de todas as
// empresas; o seletor do topo troca para uma empresa, para o retrato dos
// mentorandos ou para um mentorando. Uma empresa reaproveita o dashboard da
// empresa; um mentorando, o dashboard individual.
export function AdminDashboardView() {
  const dispatch = useAppDispatch();
  const overview = useAppSelector((state) => state.dashboards.overview);
  const [params, setParams] = useSearchParams();
  const view = viewFromParams(params);

  // Os dois retratos carregam juntos: as listas do seletor saem deles.
  useEffect(() => {
    const empresas = dispatch(loadOverview('companies'));
    const mentorandos = dispatch(loadOverview('mentees'));
    return () => {
      empresas.abort();
      mentorandos.abort();
    };
  }, [dispatch]);

  const options = (kind: OverviewKind) =>
    overview[kind].data?.groups.map(({ id, label }) => ({ id, label })) ?? [];
  const filter = (
    <AdminViewFilter
      companies={options('companies')}
      mentees={options('mentees')}
      value={view}
      onChange={(next) => {
        setParams(paramsFromView(next));
      }}
    />
  );

  // A `key` recomeça o dashboard da empresa ao trocar de empresa ou de
  // mentorando: o período escolhido na anterior não vale na nova.
  if (view.kind === 'company') {
    return (
      <CompanyDashboardView
        key={view.id}
        organizationId={view.id}
        extraFilters={filter}
      />
    );
  }
  // O mentorando abre o dashboard individual dele, como ele mesmo vê.
  if (view.kind === 'mentee') {
    return (
      <UserDashboardView
        key={view.id}
        memberId={view.id}
        extraFilters={filter}
      />
    );
  }
  return <OverviewDashboard kind={view.kind} filter={filter} />;
}

interface OverviewDashboardProps {
  kind: OverviewKind;
  filter: ReactNode;
}

// O retrato atual: cada pessoa entra com a resposta mais recente que enviou.
// No lugar do filtro de período, de quando são as respostas.
function OverviewDashboard({ kind, filter }: OverviewDashboardProps) {
  const { t, i18n } = useTranslation(['comum', 'dashboard']);
  const { data, status, error } = useAppSelector(
    (state) => state.dashboards.overview[kind],
  );
  const label =
    kind === 'companies'
      ? t('dashboard:todasEmpresas')
      : t('dashboard:todosMentorandos');
  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(iso));

  return (
    <div className="dashboard-view flex min-h-svh flex-col overflow-hidden bg-background">
      <PageHeader eyebrow={label} title={t('dashboard:titulo')} />

      <main
        className={cn(
          'flex flex-col gap-8 pb-10',
          pageGutterClassName,
          screenEnterClassName,
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          {filter}
          {data && (
            <ShownChip>
              {t('dashboard:respostasEntre', {
                inicio: formatDate(data.responses_from),
                fim: formatDate(data.responses_to),
              })}
            </ShownChip>
          )}
        </div>

        {status === 'loading' && !data && (
          <LoadingState>
            <Skeleton className="h-80 w-full rounded-2xl" />
          </LoadingState>
        )}

        {status === 'error' && error === 'dashboard:semResultadoEmpresa' && (
          <EmptyState>{t('dashboard:semResultadoEmpresa')}</EmptyState>
        )}

        {status === 'error' && error !== 'dashboard:semResultadoEmpresa' && (
          <ErrorState message={error && t(error)} />
        )}

        {data && (
          <>
            <SummaryCards nomeEmpresa={label} {...data.company_summary} />

            <OverviewSection
              period=""
              scores={data.scores}
              dimensions={data.dimensions}
              viewLabel={label}
              organizationName={label}
              comparisonOptions={SEM_PERIODOS}
              comparisons={data.comparisons}
              scopeOptions={data.groups.map(({ id, label: name }) => ({
                id,
                label: name,
              }))}
              scopePlaceholder={
                kind === 'companies'
                  ? t('dashboard:Empresa')
                  : t('dashboard:Mentorando')
              }
              alignment={data.alignment}
              groupMatrix={{
                title:
                  kind === 'companies'
                    ? t('dashboard:mapaEmpresas')
                    : t('dashboard:mapaMentorandos'),
                heading:
                  kind === 'companies'
                    ? t('dashboard:Empresa')
                    : t('dashboard:Mentorando'),
                rows: data.groups,
              }}
            />

            <ResultText empresa {...data.creed_summary} />
          </>
        )}
      </main>
    </div>
  );
}

/**
 * A rota do dashboard da empresa: a administradora tem o dela, com o seletor;
 * a gestora vê a própria organização.
 */
export function CompanyDashboardRoute() {
  const isAdmin = useAppSelector(
    (state) => state.authentication.user?.role === 'admin',
  );
  return isAdmin ? <AdminDashboardView /> : <CompanyDashboardView />;
}
