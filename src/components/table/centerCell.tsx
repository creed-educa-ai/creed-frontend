import type { ReactNode } from 'react';
import { TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';

// Célula com o conteúdo (selo, botão, lixeira) centralizado nos dois eixos.
// text-center sozinho não basta: botão e selo são inline-flex e seguem a
// linha de base do texto.
export function CenterCell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <TableCell className={cn('text-center', className)}>
      <div className="flex items-center justify-center">{children}</div>
    </TableCell>
  );
}
