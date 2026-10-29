import * as React from 'react';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

function SectionHeader({
  children,
  action,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  /** conteudo opcional a direita */
  action?: React.ReactNode;
}) {
  return (
    <div
      data-slot="section-header"
      className={cn('flex items-center gap-3', className)}
      {...props}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-primary/80" />
      <h2 className="text-lg font-bold whitespace-nowrap text-heading">
        {children}
      </h2>

      {action}

      <Separator className="flex-1 bg-primary/50 data-horizontal:h-0.5" />
    </div>
  );
}

export { SectionHeader };
