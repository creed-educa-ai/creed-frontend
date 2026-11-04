import { useId, useState, type ComponentProps, type ReactNode } from 'react';
import { format, parseISO, max, startOfToday } from 'date-fns';
import { ptBR, es, enUS, type Locale } from 'date-fns/locale';
import { CalendarIcon, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Controller, useWatch } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import type {
  ManageQuestionnaireFormValues,
  ChaveErro,
} from './manageQuestionnaireSchema';

const localeMap: Record<string, Locale> = {
  pt: ptBR,
  es: es,
  en: enUS,
};

interface ManageQuestionnaireProps {
  control: Control<ManageQuestionnaireFormValues>;
  errors: FieldErrors<ManageQuestionnaireFormValues>;
  // Sem `onConfirmar`, o botão de confirmar não aparece: num modal, quem
  // confirma é o rodapé do próprio modal (ManageQuestionnaireDialog).
  onConfirmar?: () => void;
}

export function ManageQuestionnaire({
  control,
  errors,
  onConfirmar,
}: ManageQuestionnaireProps) {
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
  const erroId = (campo: keyof ManageQuestionnaireFormValues) =>
    `${conteudoId}-${campo}-erro`;
  const ligacaoErro = (campo: keyof ManageQuestionnaireFormValues) => ({
    'aria-invalid': Boolean(errors[campo]),
    'aria-describedby': errors[campo] ? erroId(campo) : undefined,
  });

  const hoje = startOfToday();
  const minimoTermino = dataInicioValue
    ? max([hoje, parseISO(dataInicioValue)])
    : hoje;

  return (
    // O card e o título ("Gerenciar Questionário") são de quem usa o
    // componente: aqui fica só o conteúdo.
    // Uma linha por período (rótulo, data, hora) e o Confirmar embaixo, na
    // largura toda: as mesmas três linhas do "Adicionar Membro" ao lado.
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-3">
        {/* LINHA INÍCIO */}
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-20 shrink-0 items-center text-sm font-bold text-primary md:h-8">
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
                    <PickerTrigger
                      {...ligacaoErro('dataInicio')}
                      icon={<CalendarIcon />}
                      filled={Boolean(field.value)}
                    >
                      {field.value
                        ? format(parseISO(field.value), 'P', {
                            locale: currentLocale,
                          })
                        : t('painelControle:selecionarData')}
                    </PickerTrigger>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      locale={currentLocale}
                      selected={field.value ? parseISO(field.value) : undefined}
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
          <span className="flex h-10 w-20 shrink-0 items-center text-sm font-bold text-primary md:h-8">
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
                    <PickerTrigger
                      {...ligacaoErro('dataLimite')}
                      icon={<CalendarIcon />}
                      filled={Boolean(field.value)}
                    >
                      {field.value
                        ? format(parseISO(field.value), 'P', {
                            locale: currentLocale,
                          })
                        : t('painelControle:selecionarData')}
                    </PickerTrigger>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      locale={currentLocale}
                      selected={field.value ? parseISO(field.value) : undefined}
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

      {onConfirmar && (
        <Button type="button" onClick={onConfirmar} className="w-full">
          <Check aria-hidden="true" />
          {t('painelControle:confirmar')}
        </Button>
      )}
    </div>
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
        <PickerTrigger {...ariaErro} icon={<Clock />} filled={Boolean(value)}>
          {value
            ? t('painelControle:seletorHora.valor', { hora: h, minuto: m })
            : placeholder}
        </PickerTrigger>
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
                variant={h === hour ? 'default' : 'ghost'}
                onClick={() => {
                  onChange(`${hour}:${m}`);
                }}
                className="w-full"
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
                variant={m === min ? 'default' : 'ghost'}
                onClick={() => {
                  onChange(`${h}:${min}`);
                  setOpen(false);
                }}
                className="w-full"
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

// Gatilho dos seletores de data e hora com a cara dos campos de texto do
// projeto (`Input`/`InputGroup`): mesma borda, raio, fundo e altura, ícone à
// esquerda em tom apagado e o vazio na cor de placeholder. É um botão, não um
// input: abre o calendário ou a lista de horas.
// Como os inputs, não tem hover; o anel aparece ao clicar. `focus` e não
// `focus-visible`, que o navegador não liga no clique de um botão; e
// `data-[state=open]` (do Radix) segura o anel enquanto o popover está aberto,
// com o foco lá dentro.
function PickerTrigger({
  icon,
  filled,
  className,
  children,
  ...props
}: ComponentProps<'button'> & { icon: ReactNode; filled: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'flex h-10 w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg border border-primary bg-card px-2.5 text-left text-base transition-colors outline-none focus:border-ring focus:ring-3 focus:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[state=open]:border-ring data-[state=open]:ring-3 data-[state=open]:ring-ring/50 md:h-8 md:text-sm',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="flex shrink-0 text-muted-foreground [&>svg]:size-4"
      >
        {icon}
      </span>
      <span
        className={cn(
          'truncate',
          filled ? 'text-foreground' : 'text-placeholder',
        )}
      >
        {children}
      </span>
    </button>
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
