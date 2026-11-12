import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format, parseISO } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ManageQuestionnaire } from '@/features/forms/ManageQuestionnaire';
import {
  manageQuestionnaireSchema,
  type ManageQuestionnaireFormValues,
} from '@/features/forms/manageQuestionnaireSchema';
import type { MemberPeriod } from '@/types/api';

const EMPTY_PERIOD: ManageQuestionnaireFormValues = {
  dataInicio: '',
  horaInicio: '',
  dataLimite: '',
  horaLimite: '',
};

// As datas do back (ISO, com fuso) viram data e hora locais, no formato dos
// campos: 'yyyy-MM-dd' e 'HH:mm'.
function periodToValues(
  period: Pick<MemberPeriod, 'opens_at' | 'closes_at'> | null | undefined,
): ManageQuestionnaireFormValues {
  if (!period) return EMPTY_PERIOD;
  const opensAt = parseISO(period.opens_at);
  const closesAt = parseISO(period.closes_at);
  return {
    dataInicio: format(opensAt, 'yyyy-MM-dd'),
    horaInicio: format(opensAt, 'HH:mm'),
    dataLimite: format(closesAt, 'yyyy-MM-dd'),
    horaLimite: format(closesAt, 'HH:mm'),
  };
}

interface ManageQuestionnaireDialogProps {
  open: boolean;
  onClose: () => void;
  // Para quem é o questionário: o mentorando, que não está numa empresa e
  // por isso não tem o próprio painel de controle.
  personName: string;
  onSave: (values: ManageQuestionnaireFormValues) => void;
  // O período que a pessoa já tem, para abrir preenchido. Sem ele, os campos
  // abrem vazios.
  // > 🟡 Premissa P-082 — mostrar o período é da M-4; gravar é da P-5.
  initialPeriod?: Pick<MemberPeriod, 'opens_at' | 'closes_at'> | null;
}

// O "Gerenciar questionário" do painel da empresa, num modal comum: mesmos
// campos e mesma validação, com Cancelar e Confirmar no rodapé.
export function ManageQuestionnaireDialog({
  open,
  onClose,
  personName,
  onSave,
  initialPeriod,
}: ManageQuestionnaireDialogProps) {
  const { t } = useTranslation(['mentees', 'painelControle', 'comum']);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManageQuestionnaireFormValues>({
    resolver: zodResolver(manageQuestionnaireSchema),
    defaultValues: EMPTY_PERIOD,
  });

  // Ao abrir, os campos começam com o período da pessoa, se ela tiver um.
  // Depende das duas datas, e não do objeto, para não apagar o que já foi
  // digitado quando a tela de fora desenha de novo.
  const opensAt = initialPeriod?.opens_at;
  const closesAt = initialPeriod?.closes_at;
  useEffect(() => {
    if (!open) return;
    reset(
      opensAt && closesAt
        ? periodToValues({ opens_at: opensAt, closes_at: closesAt })
        : EMPTY_PERIOD,
    );
  }, [open, opensAt, closesAt, reset]);

  // O formulário vive enquanto o modal fecha e abre: limpa ao fechar, para
  // o próximo mentorando não herdar o período do anterior.
  function close() {
    reset(EMPTY_PERIOD);
    onClose();
  }

  function save(values: ManageQuestionnaireFormValues) {
    onSave(values);
    reset(EMPTY_PERIOD);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) close();
      }}
    >
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {t('mentees:questionnaireDialog.title', { name: personName })}
          </DialogTitle>
          <DialogDescription>
            {t('mentees:questionnaireDialog.description', {
              name: personName,
            })}
          </DialogDescription>
        </DialogHeader>
        <ManageQuestionnaire control={control} errors={errors} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>
            {t('comum:acoes.cancelar')}
          </Button>
          <Button
            type="button"
            onClick={() => {
              void handleSubmit(save)();
            }}
          >
            <Check aria-hidden="true" />
            {t('painelControle:confirmar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
