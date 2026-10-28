import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/pageHeader';
import { screenEnterClassName } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { DashboardToolbar } from './components/DashboardToolbar';
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
  const { t } = useTranslation(['dashboard']);
  const [period, setPeriod] = useState(currentPeriod.label);

  return (
    <div className="flex min-h-svh flex-col overflow-hidden bg-background">
      <PageHeader eyebrow={ORGANIZATION_NAME} title={t('dashboard:titulo')} />

      <main
        className={cn('flex flex-col gap-8 px-6 pb-10', screenEnterClassName)}
      >
        <DashboardToolbar
          filters={
            <PeriodFilter
              periods={periods}
              value={period}
              onChange={setPeriod}
            />
          }
        />

        <OverviewSection current={currentPeriod} previous={previousPeriod} />

        <ResultadoText {...creedSummary} />
      </main>
    </div>
  );
}
