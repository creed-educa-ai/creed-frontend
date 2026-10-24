import { useId, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR, es, enUS, type Locale } from 'date-fns/locale';
import { CalendarIcon, ChevronDown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Controller, useWatch } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import type {
  GerenciarQuestionarioFormValues,
  ChaveErro,
} from './GerenciarQuestionarioSchema';

const localeMap: Record<string, Locale> = {
  pt: ptBR,
  es: es,
  en: enUS,
};

interface GerenciarQuestionarioProps {
  control: Control<GerenciarQuestionarioFormValues>;
  errors: FieldErrors<GerenciarQuestionarioFormValues>;
  onConfirmar?: () => void;
  minGeral?: string;
}

export function GerenciarQuestionario({
  control,
  errors,
  onConfirmar,
  minGeral,
}: GerenciarQuestionarioProps) {
  const { t, i18n } = useTranslation(['painelControle']);
  const [isOpen, setIsOpen] = useState(true);

  const [openInicio, setOpenInicio] = useState(false);
  const [openLimite, setOpenLimite] = useState(false);

  const dataInicioValue = useWatch({
    control,
    name: 'dataInicio',
  });

  const currentLocale = localeMap[i18n.language] ?? enUS;
  const minDateGeral = minGeral ? parseISO(minGeral) : undefined;
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

                {/* DATA INÍCIO */}
                <Controller
                  name="dataInicio"
                  control={control}
                  render={({ field }) => (
                    <Popover open={openInicio} onOpenChange={setOpenInicio}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-auto justify-start gap-3 rounded-2xl border-primary/50 text-primary hover:bg-primary/5"
                        >
                          <CalendarIcon size={18} />
                          {field.value
                            ? format(parseISO(field.value), 'P', {
                                locale: currentLocale,
                              })
                            : t('painelControle:selecionarData')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          locale={currentLocale}
                          selected={
                            field.value ? parseISO(field.value) : undefined
                          }
                          disabled={
                            minDateGeral ? { before: minDateGeral } : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(format(date, 'yyyy-MM-dd'));
                              setOpenInicio(false);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.dataInicio?.message && (
                  <span className="text-xs text-red-500">
                    {t(errors.dataInicio.message as ChaveErro)}
                  </span>
                )}

                {/* HORA INÍCIO */}
                <Controller
                  name="horaInicio"
                  control={control}
                  render={({ field }) => (
                    <TimePickerPopover
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t('painelControle:selecionarHora')}
                    />
                  )}
                />
                {errors.horaInicio?.message && (
                  <span className="text-xs text-red-500">
                    {t(errors.horaInicio.message as ChaveErro)}
                  </span>
                )}
              </div>

              {/* COLUNA TÉRMINO */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-primary">
                  {t('painelControle:termino')}
                </span>

                {/* DATA TÉRMINO */}
                <Controller
                  name="dataLimite"
                  control={control}
                  render={({ field }) => (
                    <Popover open={openLimite} onOpenChange={setOpenLimite}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-auto justify-start gap-3 rounded-2xl border-primary/50 text-primary hover:bg-primary/5"
                        >
                          <CalendarIcon size={18} />
                          {field.value
                            ? format(parseISO(field.value), 'P', {
                                locale: currentLocale,
                              })
                            : t('painelControle:selecionarData')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          locale={currentLocale}
                          selected={
                            field.value ? parseISO(field.value) : undefined
                          }
                          disabled={(date) => {
                            if (!dataInicioValue) return false;
                            return format(date, 'yyyy-MM-dd') < dataInicioValue;
                          }}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(format(date, 'yyyy-MM-dd'));
                              setOpenLimite(false);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.dataLimite?.message && (
                  <span className="text-xs text-red-500">
                    {t(errors.dataLimite.message as ChaveErro)}
                  </span>
                )}

                {/* HORA TÉRMINO */}
                <Controller
                  name="horaLimite"
                  control={control}
                  render={({ field }) => (
                    <TimePickerPopover
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t('painelControle:selecionarHora')}
                    />
                  )}
                />
                {errors.horaLimite?.message && (
                  <span className="text-xs text-red-500">
                    {t(errors.horaLimite.message as ChaveErro)}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 sm:mt-0 sm:self-center">
              <Button
                type="button"
                variant="default"
                onClick={onConfirmar}
                className="rounded-full px-6 py-2 hover:bg-primary/90"
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

function TimePickerPopover({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [h = '12', m = '30'] = value ? value.split(':') : [];

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, '0'),
  );
  const minutes = ['00', '15', '30', '45'];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-48 justify-start gap-3 rounded-2xl border-primary/50 text-primary hover:bg-primary/5"
        >
          <Clock size={18} />
          <span>{value ? value.replace(':', 'h') : placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 rounded-2xl border border-border bg-white p-2 shadow-md">
        <div className="flex h-48 gap-2">
          {/* COLUNA HORA */}
          <div className="flex-1 space-y-1 overflow-y-auto pr-1">
            <div className="sticky top-0 bg-white px-2 py-1 text-xs font-bold text-primary">
              Hora
            </div>
            {hours.map((hour) => (
              <Button
                key={hour}
                type="button"
                variant="ghost"
                onClick={() => {
                  onChange(`${hour}:${m}`);
                }}
                className={`w-full cursor-pointer rounded-lg py-1.5 text-center text-sm transition-colors ${
                  h === hour ? 'bg-primary font-bold text-white' : ''
                }`}
              >
                {hour}h
              </Button>
            ))}
          </div>
          {/* COLUNA MINUTO */}
          <div className="flex-1 space-y-1 overflow-y-auto border-l border-border pl-1">
            <div className="sticky top-0 bg-white px-2 py-1 text-xs font-bold text-primary">
              Min
            </div>
            {minutes.map((min) => (
              <Button
                key={min}
                type="button"
                variant="ghost"
                onClick={() => {
                  onChange(`${h}:${min}`);
                  setOpen(false);
                }}
                className={`w-full cursor-pointer rounded-lg py-1.5 text-center text-sm transition-colors ${
                  m === min ? 'bg-primary font-bold text-white' : ''
                }`}
              >
                {min}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
