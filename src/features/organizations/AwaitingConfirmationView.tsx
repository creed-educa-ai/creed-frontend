import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CreedSymbol from '@/components/logos/logo';
import { Button } from '@/components/ui/button';
import { useBrandAnimationDelay } from '@/hooks/useBrandAnimationDelay';
import { cn } from '@/lib/utils';
import { pageTitleClassName } from '@/lib/typography';

export function AwaitingConfirmationView() {
  const { t } = useTranslation(['aguardeConfirmacao']);
  const atrasoDaAnimacao = useBrandAnimationDelay();

  return (
    // Mesmo fundo girando do painel do AuthLayout, no mesmo ponto do relógio,
    // e o mesmo nome de transição: vindo do cadastro, o painel cresce até
    // virar esta tela (ver `transicao-painel-marca` em index.css).
    <div
      className="bg-brand animate-brand-giro transicao-painel-marca flex min-h-svh flex-col items-center justify-center gap-6 p-10 text-center text-primary-foreground"
      style={{ animationDelay: atrasoDaAnimacao }}
    >
      <CreedSymbol animated className="size-28" />

      <div>
        <h1 className={cn(pageTitleClassName, 'text-inherit')}>
          {t('aguardeConfirmacao:titulo')}
        </h1>
        <p className="mt-2 max-w-sm text-sm/relaxed opacity-90">
          {t('aguardeConfirmacao:mensagem')}
        </p>
      </div>

      <Button asChild variant="outline" className="w-full max-w-xs">
        <Link to="/">{t('aguardeConfirmacao:voltar')}</Link>
      </Button>

      <div className="flex w-full max-w-xs items-center gap-3 text-xs opacity-80">
        <span className="h-px flex-1 bg-accent" />
        {t('aguardeConfirmacao:ouSaibaMais')}
        <span className="h-px flex-1 bg-accent" />
      </div>

      <Button asChild variant="outline" className="w-full max-w-xs">
        <Link to="/about">{t('aguardeConfirmacao:saibaMais')}</Link>
      </Button>
    </div>
  );
}
