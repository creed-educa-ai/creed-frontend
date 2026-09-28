import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-light.svg';

export function SobreView() {
  const { t } = useTranslation(['sobre']);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-svh flex-col bg-background p-6 lg:p-12">
      {/* Container de Título/Subtítulo topo esquerdo */}
      <div className="mx-auto w-full max-w-xl">
        <h1 className="text-3xl font-bold text-heading">{t('sobre:titulo')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('sobre:subtitulo')}
        </p>
      </div>

      {/* Conteúdo centralizado (Card e Botão) */}
      <div className="mx-auto my-auto flex w-full max-w-xl flex-col items-center justify-center gap-6 py-6">
        {/* Card externo em bg-card com p-5 gerando a bordinha (buffer) */}
        <div className="w-full rounded-2xl border border-border bg-card p-5 shadow-sm">
          {/* Banner roxo da marca (bg-brand)*/}
          <div className="bg-brand flex items-center justify-center gap-4 rounded-xl p-8 text-primary-foreground">
            <CreedSymbol className="size-23" />
            <img src={wordmark} alt="CREED.ai" className="w-36" />
          </div>

          {/* Área do texto dentro do card */}
          <div className="p-4 pt-6">
            <p className="text-sm leading-relaxed text-card-foreground">
              {t('sobre:texto')}
            </p>
          </div>
        </div>

        {/* Botão voltar padronizado */}
        <div className="w-full">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              navigate(-1);
            }}
          >
            {t('sobre:voltar')}
          </Button>
        </div>
      </div>
    </div>
  );
}
