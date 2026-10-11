import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-light.svg';
import { Button } from '@/components/ui/button';
import { useAtrasoDaAnimacaoMarca } from '@/hooks/useAtrasoDaAnimacaoMarca';

// Tela de "respostas enviadas", depois de confirmar o envio na revisão.
// Copiada da AguardeConfirmacaoView: mesmo fundo da marca girando e mesmo
// símbolo animado, com a wordmark embaixo e só a ação de voltar.
export function SubmissionConfirmationView() {
  const { t } = useTranslation(['respostasEnviadas']);
  const atrasoDaAnimacao = useAtrasoDaAnimacaoMarca();

  return (
    // A tela roxa aparece com fade-in. Fica num div por fora porque o fade e
    // o giro do degradê usam a mesma propriedade `animation`: no mesmo
    // elemento, um apagaria o outro.
    <div className="animate-in duration-700 ease-out fade-in motion-reduce:animate-none">
      <div
        className="bg-brand animate-brand-giro flex min-h-svh flex-col items-center justify-center gap-6 p-10 text-center text-primary-foreground"
        style={{ animationDelay: atrasoDaAnimacao }}
      >
        <div className="flex flex-col items-center gap-4">
          <CreedSymbol animated className="size-28" />
          <img src={wordmark} alt="CREED.ai" className="w-44" />
        </div>

        <div className="mt-6">
          <h1 className="text-2xl font-bold">
            {t('respostasEnviadas:titulo')}
          </h1>
          <p className="mt-2 max-w-sm text-sm/relaxed opacity-90">
            {t('respostasEnviadas:mensagem')}
          </p>
        </div>

        <Button asChild className="w-full max-w-xs">
          <Link to="/onboard-quest">{t('respostasEnviadas:voltar')}</Link>
        </Button>
      </div>
    </div>
  );
}
