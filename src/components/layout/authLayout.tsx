// src/components/layout/AuthLayout.tsx
import * as React from 'react';
import CreedSymbol, { Wordmark } from '@/components/logos/logo';
import { useAtrasoDaAnimacaoMarca } from '@/hooks/useAtrasoDaAnimacaoMarca';

interface AuthLayoutProps {
  children: React.ReactNode; // coluna esquerda: título + campos + botões
  titulo: React.ReactNode; // headline do painel roxo
  subtitulo?: React.ReactNode; // texto de apoio (opcional)
  carregando?: boolean; // gira o símbolo do painel enquanto a ação processa
}

export function AuthLayout({
  children,
  titulo,
  subtitulo,
  carregando = false,
}: AuthLayoutProps) {
  const atrasoDaAnimacao = useAtrasoDaAnimacaoMarca();

  return (
    <div className="flex min-h-svh flex-col bg-background lg:flex-row">
      {/* ESQUERDA — conteúdo da tela */}
      <div className="flex w-full flex-1 flex-col justify-center p-6 lg:w-[55%] lg:flex-none lg:px-16 lg:py-10">
        {/* Entrada de baixo para cima a cada tela. Cada tela monta o próprio
            AuthLayout, então a animação roda na troca de página, e não quando
            a tela só re-renderiza (digitar, enviar). */}
        <div className="mx-auto w-full max-w-md animate-in duration-500 ease-out fade-in slide-in-from-bottom-8 motion-reduce:animate-none">
          {children}
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
        <CreedSymbol animated={carregando} className="size-10 lg:size-24" />
        {/* O SVG não tem texto: sem o rótulo, leitor de tela não anuncia a marca. */}
        <Wordmark
          role="img"
          aria-label="CREED.ai"
          className="h-6 w-auto lg:h-10"
        />
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
