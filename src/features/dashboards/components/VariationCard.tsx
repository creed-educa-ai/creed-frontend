import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InfoTip } from './InfoTip';
import { PRISMAS } from '@/features/dashboards/prismas';
import type { PrismaScores } from './PrismaRadarChart';

interface VariationCardProps {
  scores: PrismaScores;
  // O recorte das notas, ex.: "Marketing 2026/1".
  shownLabel: string;
  // Sem comparação, o card mostra só as notas, sem setas.
  comparison?: { label: string; variation: PrismaScores } | undefined;
}

function VariationBadge({ value }: { value: number }) {
  const { t } = useTranslation(['dashboardPrisma']);
  const Icon = value > 0 ? ArrowUp : value < 0 ? ArrowDown : Minus;
  const description =
    value > 0
      ? t('dashboardPrisma:variacao.aumentou', { valor: value })
      : value < 0
        ? t('dashboardPrisma:variacao.diminuiu', { valor: Math.abs(value) })
        : t('dashboardPrisma:variacao.estavel');

  return (
    <span
      className={cn(
        'flex w-12 items-center justify-end gap-0.5 text-sm font-bold',
        value > 0 && 'text-success',
        value < 0 && 'text-destructive',
        value === 0 && 'text-muted-foreground',
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      <span aria-hidden="true">{value === 0 ? '' : Math.abs(value)}</span>
      <span className="sr-only">{description}</span>
    </span>
  );
}

export function VariationCard({
  scores,
  shownLabel,
  comparison,
}: VariationCardProps) {
  const { t } = useTranslation(['dashboardPrisma', 'dashboard']);

  // Comparando, do que mais subiu para o que mais caiu; sem comparação, da
  // maior nota para a menor.
  const ordered = [...PRISMAS].sort((a, b) =>
    comparison
      ? comparison.variation[b] - comparison.variation[a]
      : scores[b] - scores[a],
  );

  return (
    <article className="flex h-full flex-col rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex items-center gap-1.5">
        <h3 className="text-xl font-bold text-heading">
          {t('dashboardPrisma:variacao.titulo')}
        </h3>
        <InfoTip
          title={t('dashboardPrisma:variacao.titulo')}
          text={t('dashboard:info.variacao')}
        />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {comparison
          ? t('dashboardPrisma:variacao.comparadoCom', {
              exibido: shownLabel,
              referencia: comparison.label,
            })
          : t('dashboardPrisma:variacao.semComparacao', {
              exibido: shownLabel,
            })}
      </p>

      {/* As linhas dividem a altura do card: ao lado do radar, os dois cards
          ficam nivelados sem sobrar espaço embaixo da lista. */}
      <ul className="mt-3 flex flex-1 flex-col divide-y divide-border">
        {ordered.map((prisma) => {
          // Primeira palavra em destaque, o resto em cinza (como no Figma).
          const [first, ...rest] = t(`dashboardPrisma:prismas.${prisma}`).split(
            ' ',
          );

          return (
            <li
              key={prisma}
              className="flex flex-1 items-center justify-between gap-3 py-2.5"
            >
              <span className="text-sm">
                <span className="font-bold text-heading">{first}</span>
                {rest.length > 0 && (
                  <span className="font-medium text-muted-foreground">
                    {' '}
                    {rest.join(' ')}
                  </span>
                )}
              </span>

              {/* A seta vem antes da nota, e sem comparação o espaço dela
                  fica reservado: a nota não muda de lugar ao trocar. */}
              <span className="flex items-center gap-2">
                {comparison ? (
                  <VariationBadge value={comparison.variation[prisma]} />
                ) : (
                  <span className="w-12" aria-hidden="true" />
                )}
                <span className="text-xl font-bold text-heading">
                  {scores[prisma]}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
