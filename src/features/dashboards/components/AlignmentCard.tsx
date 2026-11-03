import { useTranslation } from 'react-i18next';
import type { TeamAlignment } from '@/features/dashboards/dashboardsApi';
import { PRISMAS } from '@/features/dashboards/prismas';
import { cn } from '@/lib/utils';
import { InfoTip } from './InfoTip';

interface AlignmentCardProps {
  alignment: TeamAlignment;
  // O recorte, ex.: "Marketing 2026/1".
  shownLabel: string;
}

const BANDS = ['baixa', 'media', 'alta'] as const;

// Do mais claro ao mais escuro: a nota sobe junto com o tom.
const BAND_COLORS: Record<(typeof BANDS)[number], string> = {
  baixa: 'bg-chart-4',
  media: 'bg-chart-2',
  alta: 'bg-chart-1',
};

const LEVEL_COLORS = {
  alinhado: 'text-success',
  moderado: 'text-muted-foreground',
  dividido: 'text-warning',
};

// Se o grupo deu notas parecidas em cada prisma ou se dividiu. Cada barra é o
// grupo inteiro, repartido entre quem ficou com nota baixa, média e alta: uma
// equipe dividida tem as duas pontas cheias e o meio vazio.
export function AlignmentCard({ alignment, shownLabel }: AlignmentCardProps) {
  const { t } = useTranslation(['dashboardPrisma', 'dashboard']);
  const { prismas, respondents } = alignment;

  return (
    <article className="rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex items-center gap-1.5">
        <h3 className="text-xl font-bold text-heading">
          {t('dashboardPrisma:alinhamento.titulo')}
        </h3>
        <InfoTip
          title={t('dashboardPrisma:alinhamento.titulo')}
          text={t('dashboard:info.alinhamento')}
        />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('dashboardPrisma:alinhamento.respostas', {
          exibido: shownLabel,
          total: respondents,
        })}
      </p>

      {prismas === null ? (
        <p className="mt-4 text-sm text-card-foreground">
          {t('dashboardPrisma:alinhamento.semRespostas')}
        </p>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {BANDS.map((band) => (
              <span key={band} className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={cn('size-3 rounded-sm', BAND_COLORS[band])}
                />
                {t(`dashboardPrisma:alinhamento.faixas.${band}`)}
              </span>
            ))}
          </div>

          <ul className="mt-4 flex flex-col gap-4">
            {PRISMAS.map((prisma) => {
              const { bands, level } = prismas[prisma];

              return (
                <li
                  key={prisma}
                  className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4"
                >
                  <span className="text-sm font-bold text-heading sm:w-52 sm:shrink-0">
                    {t(`dashboardPrisma:prismas.${prisma}`)}
                  </span>

                  {/* Cada pedaço cresce na proporção das pessoas da faixa. */}
                  <div
                    className="flex h-4 flex-1 gap-0.5 overflow-hidden rounded-full"
                    aria-hidden="true"
                  >
                    {BANDS.map(
                      (band) =>
                        bands[band] > 0 && (
                          <div
                            key={band}
                            className={BAND_COLORS[band]}
                            style={{ flexGrow: bands[band] }}
                          />
                        ),
                    )}
                  </div>
                  <span className="sr-only">
                    {t('dashboardPrisma:alinhamento.leitor', bands)}
                  </span>

                  <span
                    className={cn(
                      'text-sm font-semibold sm:w-24 sm:shrink-0 sm:text-right',
                      LEVEL_COLORS[level],
                    )}
                  >
                    {t(`dashboardPrisma:alinhamento.niveis.${level}`)}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </article>
  );
}
