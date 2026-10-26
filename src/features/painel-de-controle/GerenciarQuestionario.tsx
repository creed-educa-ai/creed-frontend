import { useId, useState } from 'react';
import { format, parseISO, max, startOfToday } from 'date-fns';
import { ptBR, es, enUS, type Locale } from 'date-fns/locale';
import { CalendarIcon, Clock } from 'lucide-react';
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
}

export function GerenciarQuestionario({
  control,
  errors,
  onConfirmar,
}: GerenciarQuestionarioProps) {
  const { t, i18n } = useTranslation(['painelControle']);
  const [openInicio, setOpenInicio] = useState(false);
  const [openLimite, setOpenLimite] = useState(false);

  const dataInicioValue = useWatch({
    control,
    name: 'dataInicio',
  });

  const idioma = i18n.language.split('-')[0] ?? 'pt';
  const currentLocale = localeMap[idioma] ?? ptBR;
  const conteudoId = useId();
  const erroId = (campo: keyof GerenciarQuestionarioFormValues) =>
    `${conteudoId}-${campo}-erro`;
  const ligacaoErro = (campo: keyof GerenciarQuestionarioFormValues) => ({
    'aria-invalid': Boolean(errors[campo]),
    'aria-describedby': errors[campo] ? erroId(campo) : undefined,
  });

  const hoje = startOfToday();
  const minimoTermino = dataInicioValue
    ? max([hoje, parseISO(dataInicioValue)])
    : hoje;

  return (
    // O título da seção ("Gerenciar Questionário") é de quem usa o componente.
    <section className="h-full w-full">
      {/* Uma linha por período (rótulo, data, hora) e o Confirmar à direita
          das duas: duas linhas de controles, a mesma altura do card de
          adicionar membro ao lado. Sem largura, o Confirmar desce. */}
      <div className="flex h-full flex-wrap items-center gap-4 rounded-3xl bg-card p-6 shadow-sm">
        <div className="flex min-w-72 flex-1 flex-col gap-3">
          {/* LINHA INÍCIO */}
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-20 shrink-0 items-center text-sm font-bold text-primary">
              {t('painelControle:inicio')}
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {/* DATA INÍCIO */}
              <Controller
                name="dataInicio"
                control={control}
                render={({ field }) => (
                  <Popover open={openInicio} onOpenChange={setOpenInicio}>
                    <PopoverTrigger asChild>
                      <Button
                        {...ligacaoErro('dataInicio')}
                        type="button"
                        variant="outline"
                        className="h-10 w-full justify-start gap-2 rounded-2xl border-primary px-3 text-primary hover:bg-accent"
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
                        disabled={{ before: hoje }}
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
              <MensagemErro
                id={erroId('dataInicio')}
                mensagem={errors.dataInicio?.message}
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {/* HORA INÍCIO */}
              <Controller
                name="horaInicio"
                control={control}
                render={({ field }) => (
                  <TimePickerPopover
                    {...ligacaoErro('horaInicio')}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t('painelControle:selecionarHora')}
                  />
                )}
              />
              <MensagemErro
                id={erroId('horaInicio')}
                mensagem={errors.horaInicio?.message}
              />
            </div>
          </div>

          {/* LINHA TÉRMINO */}
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-20 shrink-0 items-center text-sm font-bold text-primary">
              {t('painelControle:termino')}
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {/* DATA TÉRMINO */}
              <Controller
                name="dataLimite"
                control={control}
                render={({ field }) => (
                  <Popover open={openLimite} onOpenChange={setOpenLimite}>
                    <PopoverTrigger asChild>
                      <Button
                        {...ligacaoErro('dataLimite')}
                        type="button"
                        variant="outline"
                        className="h-10 w-full justify-start gap-2 rounded-2xl border-primary px-3 text-primary hover:bg-accent"
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
                        disabled={{ before: minimoTermino }}
                        defaultMonth={
                          field.value ? parseISO(field.value) : minimoTermino
                        }
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
              <MensagemErro
                id={erroId('dataLimite')}
                mensagem={errors.dataLimite?.message}
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {/* HORA TÉRMINO */}
              <Controller
                name="horaLimite"
                control={control}
                render={({ field }) => (
                  <TimePickerPopover
                    {...ligacaoErro('horaLimite')}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t('painelControle:selecionarHora')}
                  />
                )}
              />
              <MensagemErro
                id={erroId('horaLimite')}
                mensagem={errors.horaLimite?.message}
              />
            </div>
          </div>
        </div>

        <div className="ml-auto">
          <Button
            type="button"
            variant="default"
            onClick={onConfirmar}
            className="rounded-full px-6 py-2 hover:bg-primary-hover"
          >
            {t('painelControle:confirmar')}
          </Button>
        </div>
      </div>
    </section>
  );
}

function TimePickerPopover({
  value,
  onChange,
  placeholder,
  ...ariaErro
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  'aria-invalid': boolean;
  'aria-describedby': string | undefined;
}) {
  const { t } = useTranslation(['painelControle']);
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
          {...ariaErro}
          type="button"
          variant="outline"
          className="h-10 w-full justify-start gap-2 rounded-2xl border-primary px-3 text-primary hover:bg-accent"
        >
          <Clock size={18} />
          <span>
            {value
              ? t('painelControle:seletorHora.valor', { hora: h, minuto: m })
              : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 rounded-2xl border border-border bg-popover p-2 shadow-md">
        <div className="flex h-48 gap-2">
          {/* COLUNA HORA */}
          <div className="flex-1 space-y-1 overflow-y-auto pr-1">
            <div className="sticky top-0 bg-popover px-2 py-1 text-xs font-bold text-primary">
              {t('painelControle:seletorHora.hora')}
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
                  h === hour
                    ? 'bg-primary font-bold text-primary-foreground hover:bg-primary-hover'
                    : ''
                }`}
              >
                {t('painelControle:seletorHora.opcaoHora', { hora: hour })}
              </Button>
            ))}
          </div>
          {/* COLUNA MINUTO */}
          <div className="flex-1 space-y-1 overflow-y-auto border-l border-border pl-1">
            <div className="sticky top-0 bg-popover px-2 py-1 text-xs font-bold text-primary">
              {t('painelControle:seletorHora.minuto')}
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
                  m === min
                    ? 'bg-primary font-bold text-primary-foreground hover:bg-primary-hover'
                    : ''
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

function MensagemErro({
  id,
  mensagem,
}: {
  id: string;
  mensagem: string | undefined;
}) {
  const { t } = useTranslation(['painelControle']);
  if (!mensagem) {
    return null;
  }
  return (
    <span id={id} role="alert" className="text-xs text-destructive">
      {t(mensagem as ChaveErro)}
    </span>
  );
}
