import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { screenEnterClassName } from '@/lib/animations';
import { cn } from '@/lib/utils';

export function ErrorView() {
  const { t } = useTranslation(['error', 'comum']);
  const navigate = useNavigate();
  const location = useLocation();

  // `default` é a chave da primeira entrada do histórico: quem abriu /error
  // direto não tem tela anterior na plataforma, e voltar sairia dela (P-025).
  const hasNoPreviousScreen = location.key === 'default';

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
            variant="outline"
            className="w-full"
            onClick={() => {
              if (hasNoPreviousScreen) {
                navigate('/');
                return;
              }
              navigate(-1);
            }}
          >
            {t('comum:navegacao.voltar')}
          </Button>
        </div>
      </div>
    </div>
  );
}
