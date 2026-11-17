import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { screenEnterClassName } from '@/lib/animations';
import { cn } from '@/lib/utils';

export function ErrorView() {
  const { t } = useTranslation(['error', 'comum']);
  const navigate = useNavigate();

  function goBack() {
    // O React Router mantém o índice do histórico. Um redirect com replace
    // troca a chave da entrada inicial, mas o índice continua em zero (P-098).
    const historyState = window.history.state as { idx?: unknown } | null;
    const index = historyState?.idx;
    if (typeof index === 'number' && index > 0) {
      navigate(-1);
      return;
    }

    navigate('/', { replace: true });
  }

  return (
    <div className="flex min-h-svh flex-col bg-background p-6 lg:p-12">
      <div
        className={cn(
          'mx-auto my-auto flex w-full max-w-xl flex-col items-center justify-center gap-6 py-6',
          screenEnterClassName,
        )}
      >
        <div className="w-full rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p
            role="alert"
            className="p-4 text-sm leading-relaxed text-card-foreground"
          >
            {t('error:message')}
          </p>
        </div>

        <div className="w-full">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={goBack}
          >
            {t('comum:navegacao.voltar')}
          </Button>
        </div>
      </div>
    </div>
  );
}
