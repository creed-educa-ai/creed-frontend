import * as React from 'react';
import { Progress as ProgressPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    // `value` também vai para o Root: é dele que saem o aria-valuenow e o
    // estado lido pelo leitor de tela. Sem isso a barra só mudava na tela.
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn(
        'relative flex h-3 w-full items-center overflow-x-hidden rounded-full border border-primary bg-card',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="size-full flex-1 rounded-full bg-primary transition-all"
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
