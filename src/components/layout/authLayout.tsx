// src/components/layout/AuthLayout.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BotaoVoltar } from '@/components/layout/botaoVoltar';
import CreedSymbol, { Wordmark } from '@/components/logos/logo';
import { SeletorIdioma } from '@/components/SeletorIdioma';
import { useAtrasoDaAnimacaoMarca } from '@/hooks/useAtrasoDaAnimacaoMarca';

interface AuthLayoutProps {
  children: React.ReactNode; // coluna esquerda: título + campos + botões
  titulo: React.ReactNode; // headline do painel roxo
  subtitulo?: React.ReactNode; // texto de apoio (opcional)
  carregando?: boolean; // gira o símbolo do painel enquanto a ação processa
  exibirNavegacao?: boolean; // ativa voltar e link da marca nas telas que pedem isso
}

export function AuthLayout({
  children,
  titulo,
  subtitulo,
  carregando = false,
  exibirNavegacao = false,
}: AuthLayoutProps) {
  const { t } = useTranslation('comum');
  const atrasoDaAnimacao = useAtrasoDaAnimacaoMarca();
  const marca = (
    <>
      <CreedSymbol animated={carregando} className="size-10 lg:size-24" />
      {/* O SVG não tem texto: sem o rótulo, leitor de tela não anuncia a marca. */}
      <Wordmark
        role="img"
        aria-label="CREED.ai"
        className="h-6 w-auto lg:h-10"
      />
    </>
  );

  return (
    <div className="relative flex min-h-svh flex-col bg-background lg:flex-row">
      {/* No mobile a seta fica sobre o painel roxo do topo: por isso a cor
          clara abaixo de lg. */}
      {exibirNavegacao && (
        <BotaoVoltar className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground lg:text-foreground lg:hover:bg-accent lg:hover:text-accent-foreground" />
      )}

      {/* ESQUERDA — conteúdo da tela */}
      <div className="flex w-full flex-1 flex-col justify-center p-6 lg:w-[55%] lg:flex-none lg:px-16 lg:py-10">
        {/* Entrada de baixo para cima a cada tela. Cada tela monta o próprio
            AuthLayout, então a animação roda na troca de página, e não quando
            a tela só re-renderiza (digitar, enviar). */}
        <div className="mx-auto w-full max-w-md animate-in duration-500 ease-out fade-in slide-in-from-bottom-8 motion-reduce:animate-none">
          {children}
          {/* Troca de idioma em todas as telas de acesso: abaixo de tudo,
              discreta, para não competir com a ação principal da tela. */}
          <div className="mt-10 flex justify-center opacity-80 transition-opacity focus-within:opacity-100 hover:opacity-100">
            <SeletorIdioma />
          </div>
        </div>
      </div>

      {/* DIREITA — painel de marca. No mobile vai para o topo em versão compacta
          (só símbolo e wordmark), para não empurrar o formulário para baixo.
          `transicao-painel-marca`: ver index.css — é o que deixa o painel
          crescer até virar a tela de aguarde confirmação. */}
      <div
        className="bg-brand animate-brand-giro transicao-painel-marca order-first flex w-full items-center justify-center gap-3 rounded-b-3xl p-6 text-center text-primary-foreground lg:order-0 lg:w-[45%] lg:flex-col lg:gap-4 lg:rounded-l-3xl lg:rounded-br-none lg:px-16"
        style={{ animationDelay: atrasoDaAnimacao }}
      >
        {exibirNavegacao ? (
          <Link
            to="/"
            aria-label={t('navegacao.irParaBoasVindas')}
            className="inline-flex items-center gap-3 rounded-lg outline-none hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50 lg:flex-col lg:gap-4"
          >
            {marca}
          </Link>
        ) : (
          marca
        )}
        {/* Texto do painel agrupado: a margem separa a marca do texto sem
            mexer no espaço entre título e subtítulo. */}
        <div className="hidden flex-col items-center gap-4 lg:mt-10 lg:flex">
          <h2 className="max-w-sm text-2xl font-bold text-balance">{titulo}</h2>
          {subtitulo && (
            <p className="max-w-xs text-sm/relaxed text-balance opacity-90">
              {subtitulo}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
