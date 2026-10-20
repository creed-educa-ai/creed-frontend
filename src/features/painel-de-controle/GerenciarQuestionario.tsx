import { useId, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface GerenciarQuestionarioProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  min?: string;
}

export function GerenciarQuestionario({
  value,
  onChange,
  placeholder,
  min,
}: GerenciarQuestionarioProps) {
  const { t } = useTranslation(['painelControle']);
  const [open, setOpen] = useState(false); //controla a abertura do calendario
  const minDate = min ? parseISO(min) : null;
  const [isOpen, setIsOpen] = useState(true); //controla a abertura do componente
  const conteudoId = useId();

  return (
    <section className="w-full">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
          }}
          aria-expanded={isOpen}
          aria-controls={conteudoId}
          className="flex cursor-pointer items-center gap-2 text-heading"
        >
          <ChevronDown
            size={20}
            className={`transition-transform duration-200 ${
              isOpen ? 'rotate-0' : '-rotate-90'
            }`}
          />
          <h2 className="text-xl font-bold">{t('painelControle:gerenciar')}</h2>
        </button>
        <div className="h-px flex-1 bg-primary" aria-hidden="true" />
      </div>
      {isOpen && (
        <div id={conteudoId}>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" className="w-full gap-2">
                <CalendarIcon />
                {value ? parseISO(value).toLocaleDateString() : placeholder}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? parseISO(value) : undefined}
                disabled={minDate ? { before: minDate } : []}
                onSelect={(date) => {
                  if (date) {
                    onChange(format(date, 'yyyy-MM-dd'));
                    setOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </section>
  );
}
