import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sectionTitleClassName } from '@/lib/typography';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  // Controle que vale só para esta seção; fica no fim da linha do título.
  action?: ReactNode;
}

export function CollapsibleSection({
  title,
  children,
  action,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const contentId = useId();

  return (
    <section className="flex flex-col gap-4">
      {/* No celular a ação desce para a linha de baixo, inteira: ao lado do
          título ela não cabe e quebrava em pedaços. De sm para cima, tudo
          numa linha só. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIsOpen((prev) => !prev);
            }}
            aria-expanded={isOpen}
            aria-controls={contentId}
            className="flex cursor-pointer items-center gap-2 text-heading"
          >
            <ChevronDown
              size={20}
              className={`transition-transform duration-200 ${
                isOpen ? 'rotate-0' : '-rotate-90'
              }`}
            />
            <h2 className={cn(sectionTitleClassName, 'text-inherit')}>
              {title}
            </h2>
          </button>
          <div className="h-px flex-1 bg-primary" aria-hidden="true" />
        </div>
        {action}
      </div>

      {isOpen && <div id={contentId}>{children}</div>}
    </section>
  );
}
