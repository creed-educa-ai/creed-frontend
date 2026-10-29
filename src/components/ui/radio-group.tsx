import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid w-full gap-2', className)}
      {...props}
    />
  );
}

// `default` é a bolinha que o shadcn instala. `caixa` é a opção larga com o
// valor dentro, usada na escala de 1 a 5: muda só a aparência — foco
// itinerante, `aria-checked` e setas do teclado continuam vindo do Radix.
const radioGroupItemVariants = cva(
  'group/radio-group-item peer relative flex shrink-0 border outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary',
  {
    variants: {
      variant: {
        // O `after:` amplia a área de clique de um alvo de 16px. Não vale para
        // a caixa, que já nasce acima do alvo mínimo — ali a área invisível
        // invadiria a opção vizinha e roubaria o clique dela.
        default:
          'aspect-square size-4 rounded-full border-input group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-input after:absolute after:-inset-x-3 after:-inset-y-2 dark:bg-input/30 group-has-[:focus-visible]/field-label:data-checked:border-primary',
        caixa:
          'min-h-10 min-w-10 items-center justify-center rounded-lg border-primary px-4 text-base font-medium text-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function RadioGroupItem({
  className,
  variant,
  children,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> &
  VariantProps<typeof radioGroupItemVariants>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(radioGroupItemVariants({ variant }), className)}
      {...props}
    >
      {/* Quem passa conteúdo próprio (o número da escala) mostra o conteúdo;
          sem ele, o item continua sendo a bolinha de sempre. */}
      {children ?? (
        <RadioGroupPrimitive.Indicator
          data-slot="radio-group-indicator"
          className="flex size-4 items-center justify-center"
        >
          <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
        </RadioGroupPrimitive.Indicator>
      )}
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem, radioGroupItemVariants };
