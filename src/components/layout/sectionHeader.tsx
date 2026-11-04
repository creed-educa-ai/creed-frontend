import * as React from 'react';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { sectionTitleClassName } from '@/lib/typography';

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
      <span className="size-1.5 shrink-0 rounded-full bg-primary" />
      <h2 className={cn(sectionTitleClassName, 'whitespace-nowrap')}>
        {children}
      </h2>

      {action}

      <Separator className="flex-1 bg-primary-soft data-horizontal:h-0.5" />
    </div>
  );
}

export { SectionHeader };
