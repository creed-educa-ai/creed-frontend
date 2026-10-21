import { useId, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, ChevronDown, Clock } from 'lucide-react';
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
  horaInicio: string;
  onChangeHoraInicio: (value: string) => void;
  horaLimite: string;
  onChangeHoraLimite: (value: string) => void;
  onConfirmar?: () => void;
  minGeral?: string;
}

export function GerenciarQuestionario({
  valueInicio,
  onChangeInicio,
  valueLimite,
  onChangeLimite,
  horaInicio,
  onChangeHoraInicio,
  horaLimite,
  onChangeHoraLimite,
  onConfirmar,
  minGeral,
}: GerenciarQuestionarioProps) {
  const { t } = useTranslation(['painelControle']);
  const [isOpen, setIsOpen] = useState(true);

  const [openInicio, setOpenInicio] = useState(false);
  const [openLimite, setOpenLimite] = useState(false);

  const horaInicioInputRef = useRef<HTMLInputElement | null>(null);
  const horaLimiteInputRef = useRef<HTMLInputElement | null>(null);

  const minDateGeral = minGeral ? parseISO(minGeral) : null;
  const minDateLimite = valueInicio ? parseISO(valueInicio) : minDateGeral;

  const conteudoId = useId();

  const abrirSeletorHora = (
    inputRef: React.RefObject<HTMLInputElement | null>,
  ) => {
    const element = inputRef.current;
    if (element) {
      if (typeof element.showPicker === 'function') {
        element.showPicker();
      } else {
        element.focus();
      }
    }
  };

  return (
    <section className="w-full">
      {/* CABEÇALHO / HEADER */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
          }}
          aria-expanded={isOpen}
          aria-controls={conteudoId}
          className="flex cursor-pointer items-center gap-2 text-primary"
        >
          <ChevronDown
            size={20}
            className={`transition-transform duration-200 ${
              isOpen ? 'rotate-0' : '-rotate-90'
            }`}
          />
          <h2 className="text-xl font-bold">{t('painelControle:gerenciar')}</h2>
        </button>
        <div className="h-px flex-1 bg-primary/40" aria-hidden="true" />
      </div>

      {isOpen && (
        <div id={conteudoId} className="mt-4">
          <div className="flex flex-col items-start gap-4 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-6">
              {/* COLUNA INÍCIO */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-primary">
                  {t('painelControle:inicio')}
                </span>

                {/* DATA INICIO */}
                <Popover open={openInicio} onOpenChange={setOpenInicio}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-48 justify-start gap-3 rounded-2xl border-primary/50 text-primary hover:bg-primary/5"
                    >
                      <CalendarIcon size={18} />
                      {valueInicio
                        ? parseISO(valueInicio).toLocaleDateString()
                        : '1/2/2026'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={valueInicio ? parseISO(valueInicio) : undefined}
                      disabled={minDateGeral ? { before: minDateGeral } : []}
                      onSelect={(date) => {
                        if (date) {
                          const novaData = format(date, 'yyyy-MM-dd');
                          onChangeInicio(novaData);
                          if (valueLimite && valueLimite < novaData) {
                            onChangeLimite('');
                          }
                          setOpenInicio(false);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>

                {/* HORA INICIO */}
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      abrirSeletorHora(horaInicioInputRef);
                    }}
                    className="w-48 justify-start gap-3 rounded-2xl border-primary/50 text-primary hover:bg-primary/5"
                  >
                    <Clock size={18} />
                    <span>
                      {horaInicio ? horaInicio.replace(':', 'h') : '12h30'}
                    </span>
                  </Button>
                  <input
                    ref={horaInicioInputRef}
                    type="time"
                    value={horaInicio}
                    onChange={(e) => {
                      onChangeHoraInicio(e.target.value);
                    }}
                    className="sr-only"
                  />
                </div>
              </div>

              {/* COLUNA TERMINO */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-primary">
                  {t('painelControle:termino')}
                </span>

                {/* DATA TERMINO */}
                <Popover open={openLimite} onOpenChange={setOpenLimite}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-48 justify-start gap-3 rounded-2xl border-primary/50 text-primary hover:bg-primary/5"
                    >
                      <CalendarIcon size={18} />
                      {valueLimite
                        ? parseISO(valueLimite).toLocaleDateString()
                        : '1/2/2026'}
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

                {/* HORA TERMINO */}
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      abrirSeletorHora(horaLimiteInputRef);
                    }}
                    className="w-48 justify-start gap-3 rounded-2xl border-primary/50 text-primary hover:bg-primary/5"
                  >
                    <Clock size={18} />
                    <span>
                      {horaLimite ? horaLimite.replace(':', 'h') : '12h30'}
                    </span>
                  </Button>
                  <input
                    ref={horaLimiteInputRef}
                    type="time"
                    value={horaLimite}
                    onChange={(e) => {
                      onChangeHoraLimite(e.target.value);
                    }}
                    className="sr-only"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-0 sm:self-center">
              <Button
                type="button"
                onClick={onConfirmar}
                variant="default"
                className="rounded=4xl"
              >
                {t('painelControle:confirmar')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
