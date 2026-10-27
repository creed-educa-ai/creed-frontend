import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CompanyViewFilter } from './components/CompanyViewFilter';
import { DashboardHeader } from './components/DashboardHeader';
import { OverviewSection } from './components/OverviewSection';
import { PeriodFilter } from './components/PeriodFilter';
import { ResultadoText } from './components/ResultadoText';
import { ResumoCards } from './components/ResumoCards';
import {
  ORGANIZATION_NAME,
  companySummary,
  creedSummary,
  currentPeriod,
  groups,
  members,
  periods,
  previousPeriod,
} from './demoData';

// Dashboard da organização: resultado agregado, com recorte por grupo ou membro.
export function CompanyDashboardView() {
  const { t } = useTranslation(['dashboard']);
  const [period, setPeriod] = useState(currentPeriod.label);
  const [view, setView] = useState<string>(groups[0].id);

  const groupOptions = groups.map((group) => ({
    id: group.id,
    label: t(group.labelKey),
  }));

  return (
    <div className="flex min-h-svh flex-col overflow-hidden bg-background">
      <DashboardHeader
        organizationName={ORGANIZATION_NAME}
        showControlPanel
        filters={
          <>
            <PeriodFilter
              periods={periods}
              value={period}
              onChange={setPeriod}
            />
            <CompanyViewFilter
              groups={groupOptions}
              members={members}
              value={view}
              onChange={setView}
            />
          </>
        }
      />

      <main className="flex flex-col gap-8 px-6 pb-10">
        <ResumoCards nomeEmpresa={ORGANIZATION_NAME} {...companySummary} />

        <OverviewSection current={currentPeriod} previous={previousPeriod} />

        <ResultadoText empresa {...creedSummary} />
      </main>
    </div>
  );
}
