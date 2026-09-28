import type { ReactNode } from 'react';
import { BotaoVoltar } from '@/components/layout/botaoVoltar';
import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-dark.svg';
import { SeletorIdioma } from '@/components/SeletorIdioma';

interface FormLayoutProps {
  children: ReactNode;
}

// Layout leve para telas de formulário de etapa única (onboarding, wizards),
// com voltar à esquerda, marca ao centro, idioma à direita e o formulário
// centralizado.
export function FormLayout({ children }: FormLayoutProps) {
  return (
    // relative: âncora da seta de voltar, no mesmo canto do AuthLayout.
    // overflow-x-hidden: no celular o formulário ocupa a largura toda, e o
    // deslocamento da entrada criaria rolagem horizontal durante a animação.
    <div className="relative min-h-screen overflow-x-hidden px-6 py-6 sm:px-8 sm:py-8">
      <BotaoVoltar />

      {/* Topo em três colunas iguais nas laterais: a marca fica no centro
          exato da tela, com o idioma à direita. No celular não cabe tudo numa
          linha, então marca e idioma empilham, centralizados. */}
      <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center gap-2 justify-self-center sm:col-start-2">
          <CreedSymbol className="size-8 text-primary" />
          <img src={wordmark} alt="creed.ai" className="h-5" />
        </div>
        <div className="justify-self-center sm:justify-self-end">
          <SeletorIdioma />
        </div>
      </div>

      {/* Conteúdo centralizado. Cada etapa monta o próprio FormLayout, então
          a entrada pela direita roda a cada Avançar/Pular, e não quando a
          tela só re-renderiza (digitar, selecionar). */}
      {/* lg:max-w-2xl: no monitor, os títulos das perguntas cabem numa linha
          só; abaixo de lg a coluna estreita continua como estava. */}
      <div className="mx-auto mt-25 w-full max-w-md animate-in duration-500 ease-out fade-in slide-in-from-right-12 motion-reduce:animate-none lg:max-w-2xl">
        {children}
      </div>
    </div>
  );
}
