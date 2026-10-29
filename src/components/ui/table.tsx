import * as React from 'react';
import { cn } from '@/lib/utils';

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn(
          // border-separate: com border-collapse o navegador ignora o
          // border-radius das células, e o design system pede cantos
          // arredondados no cabeçalho e no hover.
          'w-full caption-bottom border-separate border-spacing-0 text-left text-sm',
          className,
        )}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        // O fundo vai nas células, para a primeira e a última arredondarem.
        'text-xs font-semibold text-muted-foreground [&_th]:bg-muted [&_th:first-child]:rounded-l-lg [&_th:last-child]:rounded-r-lg',
        className,
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&>tr:last-child>td]:border-b-0', className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'border-t bg-muted font-medium [&>tr]:last:border-b-0',
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        // Com border-separate a linha não tem borda nem fundo próprios: os dois
        // vão nas células. No hover e na seleção as pontas arredondam e a
        // linha de baixo some, para o destaque não ficar com o traço torto.
        '[&:has([aria-expanded=true])>td]:bg-accent [&:hover>td]:border-transparent [&:hover>td]:bg-accent [&:hover>td:first-child]:rounded-l-lg [&:hover>td:last-child]:rounded-r-lg [&>td]:border-b [&>td]:transition-colors [&[data-state=selected]>td]:border-transparent [&[data-state=selected]>td]:bg-muted [&[data-state=selected]>td:first-child]:rounded-l-lg [&[data-state=selected]>td:last-child]:rounded-r-lg',
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-10 px-4 py-2 text-left align-middle font-semibold whitespace-nowrap text-muted-foreground [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'px-4 py-2.5 align-middle [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
