import { useTranslation } from 'react-i18next';
import { DepartmentTag } from '@/components/department/DepartmentTag';
import type { DepartmentRow } from '@/features/dashboards/dashboardsApi';
import { PRISMAS } from '@/features/dashboards/prismas';
import { cn } from '@/lib/utils';
import { InfoTip } from './InfoTip';
import { ShownChip } from './ShownChip';
import { Card, CardContent } from '@/components/ui/card';
import { cardTitleClassName } from '@/lib/typography';

interface DepartmentMatrixCardProps {
  rows: DepartmentRow[];
  period: string;
}

// Diferenças menores que isto ficam sem cor: um ou dois pontos de distância
// da empresa é ruído, não um setor fora do padrão.
const NEUTRAL_LIMIT = 3;

// Só os tokens do tema: contorno verde acima da empresa, amarelo abaixo. Os
// números ficam no roxo dos outros cards (nota escura, diferença clara), que
// se lê melhor que texto verde ou amarelo. Um tom por lado; tons mais claros
// para diferença pequena ficam para quando o tema tiver os tokens.
function outlineColor(difference: number) {
  if (Math.abs(difference) < NEUTRAL_LIMIT) return '';
  return difference > 0 ? 'border-success' : 'border-warning';
}

// "+3" e "−9", com o sinal de menos tipográfico.
function signed(difference: number) {
  if (difference > 0) return `+${String(difference)}`;
  if (difference < 0) return `−${String(Math.abs(difference))}`;
  return '0';
}

// O mapa da organização inteira: a nota de cada setor em cada prisma, e a cor
// mostra onde o setor foge da empresa. Segue só o período do topo: o recorte
// escolhido (setor ou funcionário) não muda o mapa.
export function DepartmentMatrixCard({
  rows,
  period,
}: DepartmentMatrixCardProps) {
  const { t } = useTranslation(['dashboardPrisma', 'dashboard']);
  const title = t('dashboardPrisma:mapa.titulo');

  return (
    <Card asChild>
      <article>
        <CardContent>
          <div className="flex items-center gap-1.5">
            <h3 className={cardTitleClassName}>{title}</h3>
            <InfoTip title={title} text={t('dashboard:info.mapa')} />
          </div>
          {/* Só o período vira etiqueta: o mapa não segue o recorte. O leitor de
          tela ouve a frase inteira. */}
          <p className="mt-3 text-sm text-muted-foreground">
            <span
              aria-hidden="true"
              className="flex flex-wrap items-center gap-x-2 gap-y-1"
            >
              <ShownChip>{period}</ShownChip>
              {t('dashboardPrisma:mapa.diferenca')}
            </span>
            <span className="sr-only">
              {t('dashboardPrisma:mapa.subtitulo', { periodo: period })}
            </span>
          </p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-3 rounded-sm border-2 border-success"
              />
              {t('dashboardPrisma:mapa.acima')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-3 rounded-sm border-2 border-warning"
              />
              {t('dashboardPrisma:mapa.abaixo')}
            </span>
            <span>{t('dashboardPrisma:mapa.neutro')}</span>
          </div>

          {/* Nem toda organização tem todos os setores: o mapa lista os que o
          back mandar, e nenhum vira um aviso no lugar da tabela. */}
          {rows.length === 0 ? (
            <p className="mt-4 text-sm text-card-foreground">
              {t('dashboardPrisma:mapa.semSetores')}
            </p>
          ) : (
            <>
              {/* No celular a tabela rola de lado dentro do card, não a página. */}
              <div className="mt-4 overflow-x-auto">
                {/* Layout fixo: a coluna do setor tem largura própria e os cinco
            prismas dividem o resto por igual, sem depender do tamanho do
            título de cada um. */}
                <table className="w-full min-w-[30rem] table-fixed border-collapse text-sm">
                  <caption className="sr-only">
                    {t('dashboardPrisma:mapa.subtitulo', { periodo: period })}
                  </caption>
                  <colgroup>
                    {/* Só a largura da maior tag (Administrativo): a tag fica perto
                das notas e a tabela cabe ao lado do alinhamento. */}
                    <col className="w-32" />
                    {PRISMAS.map((prisma) => (
                      <col key={prisma} />
                    ))}
                  </colgroup>
                  <thead>
                    <tr className="border-b border-border">
                      <th
                        scope="col"
                        className="pb-2 text-left font-bold text-muted-foreground"
                      >
                        {t('dashboard:Setor')}
                      </th>
                      {PRISMAS.map((prisma) => (
                        <th
                          key={prisma}
                          scope="col"
                          className="px-1 pb-2 text-center text-[11px] leading-tight font-bold text-muted-foreground"
                        >
                          {t(`dashboardPrisma:prismas.${prisma}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(
                      ({ department, respondents, scores, difference }) => {
                        return (
                          // Linha fina entre os setores, como nas outras tabelas.
                          <tr
                            key={department}
                            className="border-b border-border last:border-b-0"
                          >
                            <th
                              scope="row"
                              className="py-2.5 pr-2 text-left font-normal"
                            >
                              {/* O setor como tag, igual à tabela de membros. O selo não
                        quebra linha: um nome em duas linhas deixaria a linha
                        inteira mais alta que as outras. */}
                              <DepartmentTag department={department} />
                              <span className="mt-1 block text-xs text-muted-foreground">
                                {t('dashboardPrisma:mapa.respostas', {
                                  total: respondents,
                                })}
                              </span>
                            </th>
                            {PRISMAS.map((prisma) => {
                              const outline =
                                difference && outlineColor(difference[prisma]);
                              return (
                                <td
                                  key={prisma}
                                  className="px-1 py-2.5 text-center whitespace-nowrap"
                                >
                                  {scores && difference ? (
                                    // O contorno é transparente na nota neutra: todas
                                    // ocupam o mesmo espaço, com ou sem cor.
                                    <span
                                      className={cn(
                                        'inline-block rounded-md border-2 border-transparent px-2 py-1',
                                        outline,
                                      )}
                                    >
                                      <span className="font-bold text-chart-1">
                                        {scores[prisma]}
                                      </span>{' '}
                                      <span className="text-xs text-chart-2">
                                        {signed(difference[prisma])}
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">
                                      —
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </article>
    </Card>
  );
}
