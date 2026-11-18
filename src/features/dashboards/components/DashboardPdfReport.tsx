import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-dark.svg';
import type {
  CompanyDashboard,
  OverviewDashboard,
  OverviewGroup,
  UserDashboard,
} from '@/features/dashboards/dashboardsApi';
import { periodLabeler } from '../periods';
import { ResultText } from './ResultText';
import { SummaryCards } from './SummaryCards';
import { OverviewSection } from './OverviewSection';

interface PrintCallbacks {
  onAfterPrint: () => void;
  onPrintError: () => void;
}

type DashboardPdfReportProps = PrintCallbacks &
  (
    | { kind: 'user'; data: UserDashboard }
    | { kind: 'company'; data: CompanyDashboard }
  );

// Abre a impressão assim que o relatório está na tela e avisa quando ela
// fecha. O conteúdo é de quem usa: cada dashboard monta o seu.
function PdfReportShell({
  onAfterPrint,
  onPrintError,
  children,
}: PrintCallbacks & { children: ReactNode }) {
  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    function afterPrint() {
      onAfterPrint();
    }

    window.addEventListener('afterprint', afterPrint, { once: true });

    void new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          timer = window.setTimeout(resolve, 50);
        });
      });
    })
      .then(() => {
        if (!cancelled) window.print();
      })
      .catch(() => {
        window.removeEventListener('afterprint', afterPrint);
        onPrintError();
      });

    return () => {
      cancelled = true;
      window.removeEventListener('afterprint', afterPrint);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [onAfterPrint, onPrintError]);

  return (
    <div className="dashboard-pdf-report" aria-hidden="true">
      <header className="dashboard-pdf-logo">
        <CreedSymbol className="h-10 w-8 text-primary" />
        <img src={wordmark} alt="CREED.ai" className="h-8 w-auto" />
      </header>

      <main className="dashboard-pdf-content">{children}</main>
    </div>
  );
}

export function DashboardPdfReport(props: DashboardPdfReportProps) {
  const { t, i18n } = useTranslation(['comum']);
  const { data, kind, onAfterPrint, onPrintError } = props;
  const periodLabel = periodLabeler(data.periods, i18n.language);

  const empresa = kind === 'company';
  const dadosEmpresa = empresa ? data : null;
  const nomeRecorte = dadosEmpresa?.department
    ? t(`comum:setores.${dadosEmpresa.department}`)
    : dadosEmpresa?.member_id
      ? (dadosEmpresa.members.find(
          (member) => member.id === dadosEmpresa.member_id,
        )?.label ?? dadosEmpresa.organization_name)
      : data.organization_name;

  return (
    <PdfReportShell onAfterPrint={onAfterPrint} onPrintError={onPrintError}>
      {empresa && (
        <section className="dashboard-pdf-keep-together">
          <SummaryCards
            nomeEmpresa={nomeRecorte}
            {...data.company_summary}
            collapsible={false}
            pdfLayout
          />
        </section>
      )}

      <section className="dashboard-pdf-keep-together">
        <OverviewSection
          pdfLayout
          period={data.period}
          scores={data.scores}
          dimensions={data.dimensions}
          viewLabel={empresa ? nomeRecorte : null}
          organizationName={data.organization_name}
          comparisonOptions={data.comparison_options}
          comparisons={data.comparisons}
          periodLabel={periodLabel}
          alignment={empresa ? data.alignment : undefined}
          departmentMatrix={empresa ? data.department_matrix : undefined}
        />
      </section>

      <section className="dashboard-pdf-summary">
        <ResultText
          {...data.creed_summary}
          empresa={empresa}
          collapsible={false}
        />
      </section>
    </PdfReportShell>
  );
}

// Sem comparação por período: o retrato atual não tem período.
const SEM_PERIODOS = { periods: [], departments: [], default_period: null };

interface OverviewPdfReportProps extends PrintCallbacks {
  data: OverviewDashboard;
  // "Todas as empresas" ou "Todos os mentorandos".
  label: string;
  // Só no retrato das empresas.
  groupMatrix?:
    { title: string; heading: string; rows: OverviewGroup[] } | undefined;
  scopePlaceholder: string;
  alignmentTitle?: string | undefined;
}

// O retrato atual da administradora (todas as empresas ou todos os
// mentorandos), com o mesmo conteúdo da tela. Já está carregado: não há outro
// recorte a pedir ao back.
export function OverviewPdfReport({
  data,
  label,
  groupMatrix,
  scopePlaceholder,
  alignmentTitle,
  onAfterPrint,
  onPrintError,
}: OverviewPdfReportProps) {
  return (
    <PdfReportShell onAfterPrint={onAfterPrint} onPrintError={onPrintError}>
      <section className="dashboard-pdf-keep-together">
        <SummaryCards
          nomeEmpresa={label}
          {...data.company_summary}
          collapsible={false}
          pdfLayout
        />
      </section>

      <section className="dashboard-pdf-keep-together">
        <OverviewSection
          pdfLayout
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
          scopePlaceholder={scopePlaceholder}
          alignment={data.alignment}
          alignmentTitle={alignmentTitle}
          groupMatrix={groupMatrix}
        />
      </section>

      <section className="dashboard-pdf-summary">
        <ResultText {...data.creed_summary} empresa collapsible={false} />
      </section>
    </PdfReportShell>
  );
}
