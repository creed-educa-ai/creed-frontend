import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { SortDirection } from '@/hooks/useTableSort';
import { tableHeadClass } from './tableStyles';

interface SortableHeadProps {
  label: string;
  direction: SortDirection | null;
  onToggle: () => void;
  // Nome acessível do botão, quando o rótulo sozinho não diz que ordena.
  ariaLabel?: string;
  className?: string;
}

// Cabeçalho de coluna que ordena ao clicar.
export function SortableHead({
  label,
  direction,
  onToggle,
  ariaLabel,
  className,
}: SortableHeadProps) {
  const Icon =
    direction === 'asc'
      ? ArrowUp
      : direction === 'desc'
        ? ArrowDown
        : ArrowUpDown;

  return (
    <TableHead
      className={className}
      aria-sort={
        direction === 'asc'
          ? 'ascending'
          : direction === 'desc'
            ? 'descending'
            : 'none'
      }
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={ariaLabel}
        className={cn(
          tableHeadClass,
          'inline-flex cursor-pointer items-center gap-1',
        )}
      >
        {label}
        <Icon
          className={cn('size-3.5', !direction && 'opacity-70')}
          aria-hidden="true"
        />
      </button>
    </TableHead>
  );
}
