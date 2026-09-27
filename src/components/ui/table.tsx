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
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead className={cn('[&_tr]:border-b', className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      className={cn('border-b transition-colors hover:bg-muted/40', className)}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'h-10 px-4 text-left align-middle text-xs font-semibold text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return <td className={cn('px-4 py-3 align-middle', className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
