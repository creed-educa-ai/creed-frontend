import type { ReactNode } from 'react';

// Lista que carregou e veio vazia (ou a busca não achou nada). É estado de
// produto, não ausência de estado: a mensagem diz o que falta.
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="rounded-lg border border-border px-4 py-8 text-center text-sm text-muted-foreground"
    >
      {children}
    </p>
  );
}
