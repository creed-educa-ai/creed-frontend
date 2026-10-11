import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-dark.svg';
import { Info, LogOut, LayoutDashboard, ClipboardPen } from 'lucide-react';
import { ModalInfo } from '@/features/responses/ModalInfo';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function OnboardQuestionarioView() {
  const { t } = useTranslation(['onboardQuestionario']);
  const [infoOpen, setInfoOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="bg-brand flex min-h-svh flex-col overflow-hidden">
      <header className="flex w-full flex-col items-center justify-center gap-4 px-6 py-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-primary-foreground">
            João Silva
          </p>
          <h1 className="text-center text-3xl font-bold text-primary-foreground sm:text-left">
            {t('onboardQuestionario:titulo')}
          </h1>
        </div>
        {/* navbar placeholder: os botões ainda não navegam */}
        <div className="flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-border bg-background p-2 sm:justify-end">
          <button
            type="button"
            aria-label={t('onboardQuestionario:menuPainel')}
            className="text-brand p-2 transition-colors hover:opacity-80"
          >
            <LayoutDashboard size={24} />
          </button>
          <button
            type="button"
            aria-label={t('onboardQuestionario:menuFormulario')}
            className="text-brand p-2 transition-colors hover:opacity-80"
          >
            <ClipboardPen size={24} />
          </button>
          <button
            type="button"
            aria-label={t('onboardQuestionario:menuInformacoes')}
            className="text-brand p-2 transition-colors hover:opacity-80"
          >
            <Info size={24} />
          </button>
          <CreedSymbol className="size-6" />
          <img src={wordmark} alt="CREED.ai" className="w-24" />
          <button
            type="button"
            aria-label={t('onboardQuestionario:menuSair')}
            className="text-brand p-2 transition-colors hover:opacity-80"
          >
            <LogOut size={24} />
          </button>
        </div>
      </header>
      <div className="flex flex-1 flex-col overflow-hidden p-6 lg:p-8">
        <div className="mx-auto my-auto flex w-full max-w-xl flex-col items-center justify-center gap-6 py-6">
          <div className="w-full rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-col items-start justify-start gap-1 rounded-xl bg-primary p-8 text-primary-foreground">
              <h2 className="text-xl font-bold text-balance">
                {t('onboardQuestionario:start')}
              </h2>
              <p className="text-balance">
                {t('onboardQuestionario:subtitulo')}
              </p>
            </div>
            <div className="p-4 pt-6">
              <p className="text-sm leading-relaxed text-card-foreground">
                {t('onboardQuestionario:mensagem')}
              </p>
            </div>
            <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-background p-2 pl-4">
              <div className="flex gap-4 text-sm text-foreground">
                <p>{t('onboardQuestionario:tempo')}</p>
                <p>{t('onboardQuestionario:secao')}</p>
              </div>
              <Button
                onClick={() => {
                  setInfoOpen(true);
                }}
              >
                {t('onboardQuestionario:iniciar')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ModalInfo
        open={infoOpen}
        onOpenChange={setInfoOpen}
        onReview={() => {
          navigate('/demograficos-1');
        }}
        onStart={() => {
          navigate('/form');
        }}
      />
    </div>
  );
}
