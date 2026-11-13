import type { ComponentProps, ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const tones = {
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  // Nem bom nem ruim (ex.: membro sem período): fundo apagado, texto escuro.
  neutral: 'bg-muted text-muted-foreground',
};

// Selo de status (Ativo, Pendente…). Cor cheia e texto claro, como no Figma.
export function StatusPill({
  tone,
  className,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-medium whitespace-nowrap text-primary-foreground',
        tone && tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

// Botão de ação da linha (Ver, Editar, Ver Resultados): retângulo de cantos
// arredondados, como os da paginação, para não ser confundido com um selo.
// A versão apagada é o próprio `disabled` do Button.
export function RowActionButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      size="sm"
      className={cn('h-7 px-3 text-xs whitespace-nowrap', className)}
      {...props}
    />
  );
}

// Lixeira da coluna "Excluir". Só abre a confirmação: quem exclui é o diálogo.
export function DeleteRowButton({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'size-8 text-destructive hover:bg-destructive hover:text-primary-foreground',
        className,
      )}
    >
      <Trash2 className="size-4" aria-hidden="true" />
    </Button>
  );
}
