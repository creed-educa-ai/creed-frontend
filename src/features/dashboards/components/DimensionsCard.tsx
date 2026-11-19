import { useTranslation } from 'react-i18next';
import {
  DIMENSIONS,
  type DimensionScores,
} from '@/features/dashboards/prismas';
import { InfoTip } from './InfoTip';
import { ShownChip } from './ShownChip';
import { Card, CardContent } from '@/components/ui/card';
import { cardTitleClassName } from '@/lib/typography';

interface DimensionsCardProps {
  scores: DimensionScores;
  // O recorte das notas, ex.: "Marketing 2026/1".
  shownLabel: string;
  // Sem comparação, só as barras.
  comparison?: { label: string; dimensions: DimensionScores } | undefined;
}

// As sete dimensões de que os prismas são feitos: mostra *por que* um prisma
// está alto ou baixo. A barra grossa é a nota exibida; a fina, logo abaixo, a
// da comparação, na mesma cor da linha tracejada do radar. Barras lado a lado
// mostram a diferença pelo comprimento.
export function DimensionsCard({
  scores,
  shownLabel,
  comparison,
}: DimensionsCardProps) {
  const { t } = useTranslation(['dashboardPrisma', 'dashboard']);

  return (
    <Card asChild className="h-full">
      <article>
        <CardContent className="flex flex-1 flex-col">
          <div className="flex items-center gap-1.5">
            <h3 className={cardTitleClassName}>
              {t('dashboardPrisma:dimensoes.titulo')}
            </h3>
            <InfoTip
              title={t('dashboardPrisma:dimensoes.titulo')}
              text={t('dashboard:info.dimensoes')}
            />
          </div>

          {/* Legenda: a barra grossa é o exibido, a fina é a comparação. */}
          <div className="mt-3 flex flex-wrap gap-2">
            <ShownChip
              swatch={
                <span
                  aria-hidden="true"
                  className="h-3 w-4 rounded-sm bg-chart-1"
                />
              }
            >
              {shownLabel}
            </ShownChip>
            {comparison && (
              <ShownChip
                swatch={
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-4 rounded-sm bg-chart-2"
                  />
                }
              >
                {comparison.label}
              </ShownChip>
            )}
          </div>

          {/* As linhas dividem a altura do card, como na variação ao lado. */}
          <ul className="mt-3 flex flex-1 flex-col gap-3">
            {DIMENSIONS.map((dimension) => {
              const name = t(`dashboardPrisma:dimensoes.nomes.${dimension}`);
              const compared = comparison?.dimensions[dimension];

              return (
                <li
                  key={dimension}
                  className="flex flex-1 flex-col justify-center gap-1.5"
                >
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0">
                      <span className="font-bold text-heading">
                        {dimension}
                      </span>{' '}
                      <span className="font-medium text-muted-foreground">
                        {name}
                      </span>
                    </span>
                    <span className="shrink-0 font-bold text-chart-1">
                      {scores[dimension]}
                      {compared !== undefined && (
                        <span className="text-chart-2"> / {compared}</span>
                      )}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1" aria-hidden="true">
                    <div className="h-3.5 rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-chart-1"
                        style={{ width: `${String(scores[dimension])}%` }}
                      />
                    </div>
                    {compared !== undefined && (
                      <div className="h-2 rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-chart-2"
                          style={{ width: `${String(compared)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </article>
    </Card>
  );
}
