// src/components/layout/AuthLayout.tsx
import * as React from 'react';
import CreedSymbol, { Wordmark } from '@/components/logos/logo';

interface AuthLayoutProps {
  children: React.ReactNode; // coluna esquerda: título + campos + botões
  titulo: React.ReactNode; // headline do painel roxo
  subtitulo?: React.ReactNode; // texto de apoio (opcional)
}

export function AuthLayout({ children, titulo, subtitulo }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      {/* ESQUERDA — formulário */}
      <div className="bg-surface flex flex-1 items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      {/* DIREITA — painel de marca (some no mobile) */}
      <div className="bg-brand hidden flex-1 flex-col items-center justify-center gap-6 p-10 text-center text-primary-foreground lg:flex">
        <CreedSymbol className="size-24" />
        <Wordmark className="h-8 w-auto" />
        <h2 className="text-3xl font-bold text-balance">{titulo}</h2>
        {subtitulo && (
          <p className="max-w-xs text-sm/relaxed text-balance opacity-90">
            {subtitulo}
          </p>
        )}
      </div>
    </div>
  );
}

export default AuthLayout;
