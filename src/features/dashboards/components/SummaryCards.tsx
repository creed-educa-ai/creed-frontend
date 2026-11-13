import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { InfoTip } from './InfoTip';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { sectionTitleClassName } from '@/lib/typography';
import type { DashboardHighlight as Metrica } from '../dashboardsApi';

interface SummaryCardsProps {
  nomeEmpresa: string;
  concluidos: number;
  convidados: number;
  destaque: Metrica;
  oportunidade: Metrica; // menor valor
  maisComum: Metrica;
  pdfLayout?: boolean;
  collapsible?: boolean;
}

interface CardMetricaProps {
  rotulo: string;
  // Texto do ícone de informação.
  info: string;
  corPonto: string;
  corTexto: string;
  metrica: Metrica;
}

function CardMetrica({
  rotulo,
  info,
  corPonto,
  corTexto,
  metrica,
}: CardMetricaProps) {
  // O back manda só o prisma e a nota: o nome e a descrição são do i18n.
  const { t } = useTranslation(['dashboardPrisma', 'dashboard']);
  return (
    <Card asChild>
      <article>
        <CardContent>
          <p
            className={`flex items-center gap-2 text-sm font-semibold ${corTexto}`}
          >
            <span
              className={`size-2 rounded-full ${corPonto}`}
              aria-hidden="true"
            />
            {rotulo} - {metrica.valor}
            <InfoTip title={rotulo} text={info} />
          </p>
          <h3 className="mt-1 text-3xl font-bold text-heading">
            {t(`dashboardPrisma:prismas.${metrica.prisma}`)}
          </h3>
          <p className="mt-2 text-xs text-card-foreground">
            {t(`dashboard:descricaoPrisma.${metrica.prisma}`)}
          </p>
        </CardContent>
      </article>
    </Card>
  );
}

export function SummaryCards({
  nomeEmpresa,
  concluidos,
  convidados,
  destaque,
  oportunidade,
  maisComum,
  pdfLayout = false,
  collapsible = true,
}: SummaryCardsProps) {
  const { t } = useTranslation(['resultado', 'dashboard']);
  const [isOpen, setIsOpen] = useState(true);
  const conteudoId = useId();

  const taxa = convidados > 0 ? Math.round((concluidos / convidados) * 100) : 0;

  return (
    <section className="w-full">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        {collapsible ? (
          <button
            type="button"
            onClick={() => {
              setIsOpen((prev) => !prev);
            }}
            aria-expanded={isOpen}
            aria-controls={conteudoId}
            className="flex cursor-pointer items-center gap-2 text-heading"
          >
            <ChevronDown
              size={20}
              className={`transition-transform duration-200 ${
                isOpen ? 'rotate-0' : '-rotate-90'
              }`}
            />
            <h2 className={cn(sectionTitleClassName, 'text-inherit')}>
              {t('resultado:resumoEmpresa', { empresa: nomeEmpresa })}
            </h2>
          </button>
        ) : (
          <h2 className={sectionTitleClassName}>
            {t('resultado:resumoEmpresa', { empresa: nomeEmpresa })}
          </h2>
        )}
        <div className="h-px flex-1 bg-primary" aria-hidden="true" />
      </div>

      {(!collapsible || isOpen) && (
        <div
          id={conteudoId}
          className={cn(
            'mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4',
            pdfLayout && 'pdf-company-summary-grid',
          )}
        >
          {/* CARD 1: TAXA DE CONCLUSÃO */}
          <Card asChild>
            <article>
              <CardContent>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm text-card-foreground">
                    {t('resultado:taxaConclusao')}
                  </p>
                  <InfoTip
                    title={t('resultado:taxaConclusao')}
                    text={t('dashboard:info.taxaConclusao')}
                  />
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <span className="text-6xl font-bold text-heading">
                    {taxa}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {concluidos}/{convidados}
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={taxa}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={t('resultado:taxaConclusao')}
                  className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${String(taxa)}%` }}
                  />
                </div>
              </CardContent>
            </article>
          </Card>

          {/* CARDS 2, 3 E 4: MÉTRICAS */}
          <CardMetrica
            rotulo={t('resultado:destaque')}
            info={t('dashboard:info.destaque')}
            corPonto="bg-success"
            corTexto="text-success"
            metrica={destaque}
          />
          <CardMetrica
            rotulo={t('resultado:oportunidade')}
            info={t('dashboard:info.oportunidade')}
            corPonto="bg-warning"
            corTexto="text-warning"
            metrica={oportunidade}
          />
          <CardMetrica
            rotulo={t('resultado:maisComum')}
            info={t('dashboard:info.maisComum')}
            corPonto="bg-brand"
            corTexto="text-primary"
            metrica={maisComum}
          />
        </div>
      )}
    </section>
  );
}
