import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/pageHeader';
import { Button } from '@/components/ui/button';
import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-light.svg';
import { screenEnterClassName } from '@/lib/animations';
import { cn } from '@/lib/utils';

export function SobreView() {
  const { t } = useTranslation(['sobre']);
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.authentication.user);
  const hasSession = user !== null;

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* O Sobre é público (boas-vindas, aguarde confirmação): o menu só
          aparece para quem tem sessão. */}
      <PageHeader title={t('sobre:titulo')} showNavMenu={hasSession} />

      {/* Conteúdo centralizado (card e, sem sessão, o Voltar) */}
      <div
        className={cn(
          'mx-auto my-auto flex w-full max-w-xl flex-col items-center justify-center gap-6 px-6 pb-10',
          screenEnterClassName,
        )}
      >
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

        {/* Com sessão, o menu do topo já leva de volta. Sem sessão não há
            menu, e o Voltar é a única saída da tela. */}
        {!hasSession && (
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
        )}
      </div>
    </div>
  );
}
