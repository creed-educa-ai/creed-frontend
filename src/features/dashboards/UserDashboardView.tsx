import { useState } from 'react';
import { DashboardHeader } from './components/DashboardHeader';
import { OverviewSection } from './components/OverviewSection';
import { PeriodFilter } from './components/PeriodFilter';
import { ResultadoText } from './components/ResultadoText';
import {
  ORGANIZATION_NAME,
  creedSummary,
  currentPeriod,
  periods,
  previousPeriod,
} from './demoData';

// Dashboard individual: o resultado de quem está logado.
export function UserDashboardView() {
  const [period, setPeriod] = useState(currentPeriod.label);

  return (
    <div className="flex min-h-svh flex-col overflow-hidden bg-background">
      <DashboardHeader
        organizationName={ORGANIZATION_NAME}
        filters={
          <PeriodFilter periods={periods} value={period} onChange={setPeriod} />
        }
      />

      <main className="flex flex-col gap-8 px-6 pb-10">
        <OverviewSection current={currentPeriod} previous={previousPeriod} />

        <ResultadoText {...creedSummary} />
      </main>
    </div>
  );
}
