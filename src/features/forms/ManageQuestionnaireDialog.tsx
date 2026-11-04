import { useForm } from 'react-hook-form';
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

const EMPTY_PERIOD: ManageQuestionnaireFormValues = {
  dataInicio: '',
  horaInicio: '',
  dataLimite: '',
  horaLimite: '',
};

interface ManageQuestionnaireDialogProps {
  open: boolean;
  onClose: () => void;
  // Para quem é o questionário: o mentorando, que não está numa empresa e
  // por isso não tem o próprio painel de controle.
  personName: string;
  onSave: (values: ManageQuestionnaireFormValues) => void;
}

// O "Gerenciar questionário" do painel da empresa, num modal comum: mesmos
// campos e mesma validação, com Cancelar e Confirmar no rodapé.
export function ManageQuestionnaireDialog({
  open,
  onClose,
  personName,
  onSave,
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
