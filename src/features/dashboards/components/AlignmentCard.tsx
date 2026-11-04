import { useTranslation } from 'react-i18next';
import type { TeamAlignment } from '@/features/dashboards/dashboardsApi';
import { PRISMAS } from '@/features/dashboards/prismas';
import { StatusPill } from '@/components/table/tablePills';
import { cn } from '@/lib/utils';
import { InfoTip } from './InfoTip';
import { ShownChip } from './ShownChip';
import { Card, CardContent } from '@/components/ui/card';
import { cardTitleClassName } from '@/lib/typography';

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

// O nível como tag, no selo de status das tabelas: verde alinhado, amarelo
// dividido e cinza no meio.
const LEVEL_COLORS = {
  alinhado: 'bg-success',
  moderado: 'bg-muted-foreground',
  dividido: 'bg-warning',
};

// Se o grupo deu notas parecidas em cada prisma ou se dividiu. Cada barra é o
// grupo inteiro, repartido entre quem ficou com nota baixa, média e alta: uma
// equipe dividida tem as duas pontas cheias e o meio vazio.
export function AlignmentCard({ alignment, shownLabel }: AlignmentCardProps) {
  const { t } = useTranslation(['dashboardPrisma', 'dashboard']);
  const { prismas, respondents } = alignment;

  return (
    <Card asChild className="h-full">
      <article>
        <CardContent className="flex flex-1 flex-col">
          <div className="flex items-center gap-1.5">
            <h3 className={cardTitleClassName}>
              {t('dashboardPrisma:alinhamento.titulo')}
            </h3>
            <InfoTip
              title={t('dashboardPrisma:alinhamento.titulo')}
              text={t('dashboard:info.alinhamento')}
            />
          </div>
          {/* O recorte em etiqueta; o leitor de tela ouve a frase inteira. */}
          <p className="mt-3 text-sm text-muted-foreground">
            <span
              aria-hidden="true"
              className="flex flex-wrap items-center gap-x-2 gap-y-1"
            >
              <ShownChip>{shownLabel}</ShownChip>
              {t('dashboardPrisma:alinhamento.total', { total: respondents })}
            </span>
            <span className="sr-only">
              {t('dashboardPrisma:alinhamento.respostas', {
                exibido: shownLabel,
                total: respondents,
              })}
            </span>
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

              {/* A lista ocupa a altura que sobra e reparte o espaço entre as
              linhas: ao lado do mapa de setores, os dois cards terminam juntos. */}
              <ul className="mt-4 flex flex-1 flex-col justify-between gap-4">
                {PRISMAS.map((prisma) => {
                  const { bands, level } = prismas[prisma];

                  return (
                    <li key={prisma} className="flex flex-col gap-1.5">
                      {/* Nome e nível numa linha, a barra embaixo com a largura
                      toda: cabe ao lado do mapa de setores. */}
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-bold text-heading">
                          {t(`dashboardPrisma:prismas.${prisma}`)}
                        </span>
                        <StatusPill
                          className={cn('shrink-0', LEVEL_COLORS[level])}
                        >
                          {t(`dashboardPrisma:alinhamento.niveis.${level}`)}
                        </StatusPill>
                      </div>

                      {/* Cada pedaço cresce na proporção das pessoas da faixa. */}
                      <div
                        className="flex h-4 gap-0.5 overflow-hidden rounded-full"
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
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </CardContent>
      </article>
    </Card>
  );
}
