import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

interface Metrica {
  titulo: string;
  valor: number;
  descricao: string;
}

interface ResumoCardsProps {
  nomeEmpresa: string;
  concluidos: number;
  convidados: number;
  destaque: Metrica;
  oportunidade: Metrica; // menor valor
  maisComum: Metrica;
}

interface CardMetricaProps {
  rotulo: string;
  corPonto: string;
  corTexto: string;
  metrica: Metrica;
}

function CardMetrica({
  rotulo,
  corPonto,
  corTexto,
  metrica,
}: CardMetricaProps) {
  return (
    <article className="rounded-2xl bg-card p-5 shadow-sm">
      <p
        className={`flex items-center gap-2 text-sm font-semibold ${corTexto}`}
      >
        <span
          className={`size-2 rounded-full ${corPonto}`}
          aria-hidden="true"
        />
        {rotulo} - {metrica.valor}
      </p>
      <h3 className="mt-1 text-3xl font-bold text-heading">{metrica.titulo}</h3>
      <p className="mt-2 text-xs text-card-foreground">{metrica.descricao}</p>
    </article>
  );
}

export function ResumoCards({
  nomeEmpresa,
  concluidos,
  convidados,
  destaque,
  oportunidade,
  maisComum,
}: ResumoCardsProps) {
  const { t } = useTranslation(['resultado']);
  const [isOpen, setIsOpen] = useState(true);
  const conteudoId = useId();

  const taxa = convidados > 0 ? Math.round((concluidos / convidados) * 100) : 0;

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
          <h2 className="text-xl font-bold">
            {t('resultado:resumoEmpresa', { empresa: nomeEmpresa })}
          </h2>
        </button>
        <div className="h-px flex-1 bg-primary" aria-hidden="true" />
      </div>

      {isOpen && (
        <div
          id={conteudoId}
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {/* CARD 1: TAXA DE CONCLUSÃO */}
          <article className="rounded-2xl bg-card p-5 shadow-sm">
            <p className="text-sm text-card-foreground">
              {t('resultado:taxaConclusao')}
            </p>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-6xl font-bold text-heading">{taxa}%</span>
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
          </article>

          {/* CARDS 2, 3 E 4: MÉTRICAS */}
          <CardMetrica
            rotulo={t('resultado:destaque')}
            corPonto="bg-success"
            corTexto="text-success"
            metrica={destaque}
          />
          <CardMetrica
            rotulo={t('resultado:oportunidade')}
            corPonto="bg-warning"
            corTexto="text-warning"
            metrica={oportunidade}
          />
          <CardMetrica
            rotulo={t('resultado:maisComum')}
            corPonto="bg-brand"
            corTexto="text-primary"
            metrica={maisComum}
          />
        </div>
      )}
    </section>
  );
}
