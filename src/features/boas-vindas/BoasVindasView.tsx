import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-light.svg';
import { ModalContato } from '@/components/modals/ModalContato';
import { useState } from 'react';

export function BoasVindasView() {
  // Os namespaces usados na tela precisam ser declarados aqui: é o que dá o
  // autocomplete das chaves. O primeiro é o padrão para chaves sem prefixo.
  const { t } = useTranslation(['boasVindas']);
  const [contatoAberto, setContatoAberto] = useState(false);

  return (
    <div className="flex min-h-svh flex-col bg-background lg:flex-row">
      {/* fundo (container principal) */}
      <div className="flex w-full flex-col justify-center p-6 lg:w-[55%] lg:px-16 lg:py-10">
        {/* container da esquerda */}
        <div className="mx-auto flex w-full max-w-md flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold text-heading">
              {t('boasVindas:titulo')}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {t('boasVindas:apresentacao')}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-muted-foreground">
              {t('boasVindas:entrar.chamada')}
            </p>
            <Button variant="default">{t('boasVindas:entrar.acao')}</Button>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-muted-foreground">
              {t('boasVindas:criarConta.chamada')}
            </p>
            <Button variant="default">{t('boasVindas:criarConta.acao')}</Button>
          </div>

          <div className="flex flex-col gap-3">
            <Button variant="outline">{t('boasVindas:saibaMais')}</Button>
            <Button
              variant="outline"
              onClick={() => {
                setContatoAberto(true);
              }}
            >
              {t('boasVindas:faleConosco')}
            </Button>
          </div>
        </div>
      </div>

      {/* container da direita — painel de marca */}
      <div className="bg-brand order-first flex w-full flex-col items-center justify-center gap-4 rounded-b-3xl p-8 text-center text-primary-foreground lg:order-none lg:w-[45%] lg:rounded-l-3xl lg:rounded-b-none lg:px-16">
        <CreedSymbol className="size-24" />
        <img src={wordmark} alt="CREED.ai" className="w-48" />
        <h3 className="max-w-sm text-lg font-bold text-balance lg:text-2xl">
          {t('boasVindas:tagline')}
        </h3>
      </div>
      <ModalContato open={contatoAberto} onOpenChange={setContatoAberto} />
    </div>
  );
}
