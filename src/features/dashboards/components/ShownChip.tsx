import type { ReactNode } from 'react';

// O recorte em destaque no topo de cada card ("Marketing 2026/1"), com o
// fundo lavanda da legenda do radar. `swatch` é o traço ou a barra que liga a
// etiqueta à série do gráfico, quando o card tem uma.
export function ShownChip({
  swatch,
  children,
}: {
  swatch?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-md border border-border bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground"
      // As mesmas cores em estilo inline, como já fazia a legenda do radar.
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--accent)',
        color: 'var(--accent-foreground)',
      }}
    >
      {swatch}
      {children}
    </span>
  );
}
