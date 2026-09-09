import type { ReactNode } from 'react';
import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-dark.svg';

interface FormLayoutProps {
  children: ReactNode;
}

// Layout leve para telas de formulário de etapa única (onboarding, wizards),
// com o cabeçalho de marca no topo à esquerda e o formulário centralizado.
export function FormLayout({ children }: FormLayoutProps) {
  return (
    <div className="min-h-screen px-6 py-6 sm:px-8 sm:py-8">
      {/* Logo no topo à esquerda */}
      <div className="flex items-center gap-2">
        <CreedSymbol className="size-8 text-primary" />
        <img src={wordmark} alt="creed.ai" className="h-5" />
      </div>

      {/* Conteúdo centralizado */}
      <div className="mx-auto mt-10 w-full max-w-md">{children}</div>
    </div>
  );
}
