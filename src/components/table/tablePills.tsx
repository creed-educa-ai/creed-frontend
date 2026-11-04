import type { ComponentProps, ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const tones = {
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
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
// `muted` é a versão clara, para linhas em que a ação existe mas não é a
// principal.
export function RowActionButton({
  muted = false,
  className,
  ...props
}: ComponentProps<typeof Button> & { muted?: boolean }) {
  return (
    <Button
      type="button"
      size="sm"
      className={cn(
        'h-7 px-3 text-xs whitespace-nowrap',
        muted && 'bg-accent text-accent-foreground hover:bg-accent/80',
        className,
      )}
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
        'size-8 text-destructive hover:bg-destructive/10 hover:text-destructive',
        className,
      )}
    >
      <Trash2 className="size-4" aria-hidden="true" />
    </Button>
  );
}
