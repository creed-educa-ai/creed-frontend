import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-dark.svg';
import { Info, LogOut, LayoutDashboard, ClipboardPen } from 'lucide-react';
import { ModalInfo } from '@/components/modals/ModalInfo';
import { useState } from 'react';

export function Onboard_QuestView() {
  const { t } = useTranslation(['Onboard_Quest']);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="bg-brand flex min-h-svh flex-col overflow-hidden">
      <header className="flex w-full items-center justify-between px-6 py-10">
        <div>
          <p className="text-sm font-bold text-primary-foreground">
            João Silva
          </p>
          <h1 className="text-3xl font-bold text-primary-foreground">
            {t('Onboard_Quest:titulo')}
          </h1>
        </div>

        <div className="flex items-center justify-end gap-1 rounded-2xl border border-border bg-background p-2">
          <button className="text-brand p-2 transition-colors hover:opacity-80">
            <LayoutDashboard size={24} />
          </button>
          <button className="text-brand p-2 transition-colors hover:opacity-80">
            <ClipboardPen size={24} />
          </button>
          <button className="text-brand p-2 transition-colors hover:opacity-80">
            <Info size={24} />
          </button>
          <CreedSymbol className="size-6" />
          <img src={wordmark} alt="CREED.ai" className="w-24" />
          <button className="text-brand p-2 transition-colors hover:opacity-80">
            <LogOut size={24} />
          </button>
        </div>
      </header>
      <div className="flex flex-1 flex-col overflow-hidden p-6 lg:p-12">
        <div className="mx-auto my-auto flex w-full max-w-xl flex-col items-center justify-center gap-6 py-6">
          <div className="w-full rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="bg-brand flex flex-col items-start justify-start gap-4 rounded-xl p-8 text-primary-foreground">
              <h2 className="text-xl font-bold text-balance">
                {t('Onboard_Quest:start')}
              </h2>
              <p className="text-balance">{t('Onboard_Quest:subtitulo')}</p>
            </div>
            <div className="p-4 pt-6">
              <p className="text-sm leading-relaxed text-card-foreground">
                {t('Onboard_Quest:mensagem')}
              </p>
              <div className="flex gap-4 pt-4">
                <p>{t('Onboard_Quest:tempo')}</p>
                <p>{t('Onboard_Quest:secao')}</p>
              </div>
            </div>
            <div className="flex w-full items-center justify-end rounded-2xl border border-border bg-background p-2">
              <Button
                className="bg-brand text-primary-foreground"
                onClick={() => {
                  setInfoOpen(true);
                }}
              >
                {t('Onboard_Quest:avancar')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ModalInfo open={infoOpen} onOpenChange={setInfoOpen} />
    </div>
  );
}
