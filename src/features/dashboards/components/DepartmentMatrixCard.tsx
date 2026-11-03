import { useTranslation } from 'react-i18next';
import { DepartmentTag } from '@/components/department/DepartmentTag';
import type { DepartmentRow } from '@/features/dashboards/dashboardsApi';
import { PRISMAS } from '@/features/dashboards/prismas';
import { cn } from '@/lib/utils';
import { InfoTip } from './InfoTip';

interface DepartmentMatrixCardProps {
  rows: DepartmentRow[];
  period: string;
}

// Diferenças menores que isto ficam sem cor: um ou dois pontos de distância
// da empresa é ruído, não um setor fora do padrão.
const NEUTRAL_LIMIT = 3;

// Só os tokens do tema: verde acima da empresa, amarelo abaixo. Um tom por
// lado; tons mais claros para diferença pequena ficam para quando o tema
// tiver os tokens.
function cellColor(difference: number) {
  if (Math.abs(difference) < NEUTRAL_LIMIT) return '';
  return difference > 0 ? 'bg-success' : 'bg-warning';
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
    <article className="rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex items-center gap-1.5">
        <h3 className="text-xl font-bold text-heading">{title}</h3>
        <InfoTip title={title} text={t('dashboard:info.mapa')} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('dashboardPrisma:mapa.subtitulo', { periodo: period })}
      </p>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-sm bg-success" />
          {t('dashboardPrisma:mapa.acima')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-sm bg-warning" />
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
            <table className="w-full min-w-[30rem] table-fixed border-separate border-spacing-1 text-sm">
              <caption className="sr-only">
                {t('dashboardPrisma:mapa.subtitulo', { periodo: period })}
              </caption>
              <colgroup>
                {/* Estreita, para a tabela caber ao lado do alinhamento: os nomes
                dos setores são curtos (RH, TI). */}
                <col className="w-44" />
                {PRISMAS.map((prisma) => (
                  <col key={prisma} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="text-left font-medium text-muted-foreground"
                  >
                    {t('dashboard:Setor')}
                  </th>
                  {PRISMAS.map((prisma) => (
                    <th
                      key={prisma}
                      scope="col"
                      className="px-1 pb-1 text-center text-[11px] leading-tight font-medium text-muted-foreground"
                    >
                      {t(`dashboardPrisma:prismas.${prisma}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ department, respondents, scores, difference }) => {
                  return (
                    <tr key={department}>
                      <th
                        scope="row"
                        className="py-1 pr-2 text-left font-normal"
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
                      {PRISMAS.map((prisma) => (
                        <td
                          key={prisma}
                          className={cn(
                            'rounded-md px-1 py-2 text-center whitespace-nowrap',
                            difference && cellColor(difference[prisma]),
                          )}
                        >
                          {scores && difference ? (
                            <>
                              <span className="font-bold text-foreground">
                                {scores[prisma]}
                              </span>{' '}
                              <span className="text-xs text-foreground">
                                {signed(difference[prisma])}
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </article>
  );
}
