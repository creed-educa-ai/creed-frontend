import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CreedSymbol from '@/components/logos/logo';
import { Button } from '@/components/ui/button';

export function AguardeConfirmacaoView() {
  const { t } = useTranslation(['aguardeConfirmacao']);

  return (
    <div className="bg-brand flex min-h-svh flex-col items-center justify-center gap-6 p-10 text-center text-primary-foreground">
      <CreedSymbol animated className="size-28" />

      <div>
        <h1 className="text-2xl font-bold">{t('aguardeConfirmacao:titulo')}</h1>
        <p className="mt-2 max-w-sm text-sm/relaxed opacity-90">
          {t('aguardeConfirmacao:mensagem')}
        </p>
      </div>

      <Button asChild variant="secondary" className="w-full max-w-xs">
        <Link to="/">{t('aguardeConfirmacao:voltar')}</Link>
      </Button>

      <div className="flex w-full max-w-xs items-center gap-3 text-xs opacity-80">
        <span className="h-px flex-1 bg-primary-foreground/40" />
        {t('aguardeConfirmacao:ouSaibaMais')}
        <span className="h-px flex-1 bg-primary-foreground/40" />
      </div>

      <Button
        asChild
        variant="outline"
        className="w-full max-w-xs bg-card text-primary"
      >
        <Link to="/sobre">{t('aguardeConfirmacao:saibaMais')}</Link>
      </Button>
    </div>
  );
}
