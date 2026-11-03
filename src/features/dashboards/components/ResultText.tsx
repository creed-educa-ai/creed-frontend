import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import type { CreedSummary } from '@/features/dashboards/dashboardsApi';
import { PRISMAS } from '@/features/dashboards/prismas';
import { cn } from '@/lib/utils';
import type { Prisma } from '@/types/api';
import { InfoTip } from './InfoTip';

interface ResultTextProps extends CreedSummary {
  // A recomendação é só da visão da empresa.
  empresa?: boolean;
}

interface PrismaCardProps {
  prisma: Prisma;
  texto: string;
  marca: 'destaque' | 'oportunidade' | null;
}

// Um card curto por prisma. O destaque e a oportunidade não têm card próprio:
// são marcados no card do prisma, para nada aparecer duas vezes.
function PrismaCard({ prisma, texto, marca }: PrismaCardProps) {
  const { t } = useTranslation(['resultado', 'dashboardPrisma', 'dashboard']);
  const nome = t(`dashboardPrisma:prismas.${prisma}`);

  return (
    <article className="flex flex-col rounded-2xl bg-card p-5 shadow-sm">
      {marca && (
        <p
          className={cn(
            'mb-1 flex items-center gap-2 text-sm font-semibold',
            marca === 'destaque' ? 'text-success' : 'text-warning',
          )}
        >
          <span
            className={cn(
              'size-2 rounded-full',
              marca === 'destaque' ? 'bg-success' : 'bg-warning',
            )}
            aria-hidden="true"
          />
          {t(`resultado:${marca}`)}
        </p>
      )}
      <div className="flex items-center gap-1.5">
        <h3 className="text-lg font-bold text-heading">{nome}</h3>
        <InfoTip title={nome} text={t('dashboard:info.creedPrisma')} />
      </div>
      <p className="mt-2 text-sm text-card-foreground">{texto}</p>
    </article>
  );
}

export function ResultText({
  analiseTexto,
  recomendacaoTexto,
  prismas,
  destaque,
  oportunidade,
  empresa = false,
}: ResultTextProps) {
  const { t } = useTranslation(['resultado', 'dashboard']);
  const [isOpen, setIsOpen] = useState(true);
  const conteudoId = useId();

  const marcaDe = (prisma: Prisma) =>
    prisma === destaque
      ? 'destaque'
      : prisma === oportunidade
        ? 'oportunidade'
        : null;

  return (
    <section className="w-full">
      {/* HEADER */}
      <div className="flex items-center gap-3">
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
          <h2 className="text-xl font-bold">{t('resultado:creedAi')}</h2>
        </button>
        <div className="h-px flex-1 bg-primary" aria-hidden="true" />
      </div>

      {isOpen && (
        <div id={conteudoId} className="mt-6 flex flex-col gap-4">
          {/* Análise geral, grande; a recomendação ao lado, na empresa. */}
          <div
            className={cn(
              'grid grid-cols-1 gap-4',
              empresa && 'lg:grid-cols-[2fr_1fr]',
            )}
          >
            <article className="rounded-2xl bg-card p-6 shadow-sm">
              <div className="flex items-center gap-1.5">
                <h3 className="text-2xl font-bold text-heading">
                  {t('resultado:analise')}
                </h3>
                <InfoTip
                  title={t('resultado:analise')}
                  text={t('dashboard:info.creedAnalise')}
                />
              </div>
              <div className="mt-3 flex flex-col gap-4 text-sm text-card-foreground">
                {analiseTexto.map((paragrafo) => (
                  <p key={paragrafo}>{paragrafo}</p>
                ))}
              </div>
            </article>

            {empresa && (
              <article className="rounded-2xl bg-card p-5 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <h3 className="flex items-center gap-2 text-2xl font-bold text-heading">
                    <span
                      className="bg-brand size-2.5 rounded-full"
                      aria-hidden="true"
                    />
                    {t('resultado:recomendacao')}
                  </h3>
                  <InfoTip
                    title={t('resultado:recomendacao')}
                    text={t('dashboard:info.creedRecomendacao')}
                  />
                </div>
                <div className="mt-2 flex flex-col gap-2 text-sm text-card-foreground">
                  {recomendacaoTexto.map((paragrafo) => (
                    <p key={paragrafo}>{paragrafo}</p>
                  ))}
                </div>
              </article>
            )}
          </div>

          {/* Um card por prisma: cinco na linha no desktop. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {PRISMAS.map((prisma) => (
              <PrismaCard
                key={prisma}
                prisma={prisma}
                texto={prismas[prisma]}
                marca={marcaDe(prisma)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
