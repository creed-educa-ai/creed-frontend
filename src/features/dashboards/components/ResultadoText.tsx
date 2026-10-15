import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

interface ResultadoTextProps {
  destaqueTexto: string;
  oportunidadeTexto: string;
  analiseTexto: string[];
  recomendacaoTexto: string[];
  empresa?: boolean;
}

export function ResultadoText({
  destaqueTexto,
  oportunidadeTexto,
  analiseTexto,
  recomendacaoTexto,
  empresa = false,
}: ResultadoTextProps) {
  const { t } = useTranslation(['resultado']);
  const [isOpen, setIsOpen] = useState(true);
  const conteudoId = useId();

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
          <h2 className="text-xl font-bold">{t('resultado:resumo')}</h2>
        </button>
        <div className="h-px flex-1 bg-primary" aria-hidden="true" />
      </div>

      {isOpen && (
        <div
          id={conteudoId}
          className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr]"
        >
          {/* COLUNA ESQUERDA */}
          <div className="flex flex-col justify-center gap-4">
            <article className="rounded-2xl bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-2xl font-bold text-heading">
                <span
                  className="size-2.5 rounded-full bg-success"
                  aria-hidden="true"
                />
                {t('resultado:destaque')}
              </h3>
              <p className="mt-2 text-sm text-card-foreground">
                {destaqueTexto}
              </p>
            </article>

            <article className="rounded-2xl bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-2xl font-bold text-heading">
                <span
                  className="size-2.5 rounded-full bg-warning"
                  aria-hidden="true"
                />
                {t('resultado:oportunidade')}
              </h3>
              <p className="mt-2 text-sm text-card-foreground">
                {oportunidadeTexto}
              </p>
            </article>

            {/* CARD DE RECOMENDAÇÃO EXCLUSIVO PARA A EMPRESA */}
            {empresa && (
              <article className="rounded-2xl bg-card p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-2xl font-bold text-heading">
                  <span
                    className="bg-brand size-2.5 rounded-full"
                    aria-hidden="true"
                  />
                  {t('resultado:recomendacao')}
                </h3>
                <div className="mt-2 flex flex-col gap-2 text-sm text-card-foreground">
                  {recomendacaoTexto.map((paragrafo) => (
                    <p key={paragrafo}>{paragrafo}</p>
                  ))}
                </div>
              </article>
            )}
          </div>

          {/* COLUNA DIREITA */}
          <article className="rounded-2xl bg-card p-6 shadow-sm">
            <h3 className="text-2xl font-bold text-heading">
              {t('resultado:analise')}
            </h3>
            <div className="mt-3 flex flex-col gap-4 text-sm text-card-foreground">
              {analiseTexto.map((paragrafo) => (
                <p key={paragrafo}>{paragrafo}</p>
              ))}
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
