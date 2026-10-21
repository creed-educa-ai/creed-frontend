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
  valueInicio: string;
  onChangeInicio: (value: string) => void;
  valueLimite: string;
  onChangeLimite: (value: string) => void;
  placeholderInicial: string;
  placeholderLimite: string;
  minGeral?: string;
}

export function GerenciarQuestionario({
  valueInicio,
  onChangeInicio,
  valueLimite,
  onChangeLimite,
  placeholderInicial,
  placeholderLimite,
  minGeral,
}: GerenciarQuestionarioProps) {
  const { t } = useTranslation(['painelControle']);
  const [isOpen, setIsOpen] = useState(true);

  const [openInicio, setOpenInicio] = useState(false);
  const [openLimite, setOpenLimite] = useState(false);

  const minDateGeral = minGeral ? parseISO(minGeral) : null;
  const minDateLimite = valueInicio ? parseISO(valueInicio) : minDateGeral;

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
        <div className="mt-4 flex flex-col gap-5">
          {/* BOTOES DATA */}
          <div id={conteudoId} className="flex gap-2">
            {/* CALENDARIO INICIAL */}
            <Popover open={openInicio} onOpenChange={setOpenInicio}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="gap-3 px-4">
                  <CalendarIcon />
                  {valueInicio
                    ? parseISO(valueInicio).toLocaleDateString()
                    : placeholderInicial}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={valueInicio ? parseISO(valueInicio) : undefined}
                  disabled={minDateGeral ? { before: minDateGeral } : []}
                  onSelect={(date) => {
                    if (date) {
                      const novaDataInicio = format(date, 'yyyy-MM-dd');
                      onChangeInicio(novaDataInicio);
                      if (valueLimite && valueLimite < novaDataInicio) {
                        onChangeLimite('');
                      }

                      setOpenInicio(false);
                    }
                  }}
                />
              </PopoverContent>
            </Popover>

            {/* CALENDARIO LIMITE */}
            <Popover open={openLimite} onOpenChange={setOpenLimite}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="gap-3 px-4">
                  <CalendarIcon />
                  {valueLimite
                    ? parseISO(valueLimite).toLocaleDateString()
                    : placeholderLimite}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={valueLimite ? parseISO(valueLimite) : undefined}
                  disabled={minDateLimite ? { before: minDateLimite } : []}
                  onSelect={(date) => {
                    if (date) {
                      onChangeLimite(format(date, 'yyyy-MM-dd'));
                      setOpenLimite(false);
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>{/* BOTOES HORA */}</div>
        </div>
      )}
    </section>
  );
}
