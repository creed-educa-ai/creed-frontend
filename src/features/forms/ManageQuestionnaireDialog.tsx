import { useEffect } from 'react';
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
import { LoadingState } from '@/components/states/LoadingState';
import { Skeleton } from '@/components/ui/skeleton';
import type { CreatePeriodError } from '@/features/forms/formsSlice';
import { ManageQuestionnaire } from '@/features/forms/ManageQuestionnaire';
import {
  manageQuestionnaireSchema,
  type ManageQuestionnaireFormValues,
} from '@/features/forms/manageQuestionnaireSchema';
import type { PeriodRead } from '@/types/api';

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
  // Abre o período no back. Devolve o erro (chave de i18n), que aparece no
  // formulário com o modal aberto, ou `null` se deu certo: aí fechar é de
  // quem usa.
  onSave: (
    values: ManageQuestionnaireFormValues,
  ) => Promise<CreatePeriodError | null>;
  // O período aberto ou agendado da pessoa: com ele, o modal só mostra as
  // datas, sem Confirmar (P-085).
  activePeriod?: Pick<
    PeriodRead,
    'opens_at' | 'closes_at' | 'period_status'
  > | null;
  // Enquanto o período da pessoa carrega, o modal não sabe se pode abrir um.
  loading?: boolean;
}

// O "Gerenciar questionário" do painel da empresa, num modal comum: mesmos
// campos e mesma validação, com Cancelar e Confirmar no rodapé.
export function ManageQuestionnaireDialog({
  open,
  onClose,
  personName,
  onSave,
  activePeriod = null,
  loading = false,
}: ManageQuestionnaireDialogProps) {
  const { t } = useTranslation(['mentees', 'painelControle', 'comum']);
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ManageQuestionnaireFormValues>({
    resolver: zodResolver(manageQuestionnaireSchema),
    defaultValues: EMPTY_PERIOD,
  });

  // Cada abertura começa com os campos vazios: o período que a pessoa já
  // tem aparece só para leitura, e um novo começa do zero.
  useEffect(() => {
    if (open) reset(EMPTY_PERIOD);
  }, [open, reset]);

  // O formulário vive enquanto o modal fecha e abre: limpa ao fechar, para
  // o próximo mentorando não herdar o período do anterior.
  function close() {
    reset(EMPTY_PERIOD);
    onClose();
  }

  async function save(values: ManageQuestionnaireFormValues) {
    const erro = await onSave(values);
    if (erro) {
      setError('root', { message: erro });
      return;
    }
    reset(EMPTY_PERIOD);
  }

  const readOnly = !loading && activePeriod !== null;

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
        {loading ? (
          <LoadingState>
            <Skeleton className="h-24 w-full" />
          </LoadingState>
        ) : (
          <ManageQuestionnaire
            control={control}
            errors={errors}
            periodoAtivo={activePeriod}
          />
        )}
        <DialogFooter>
          {/* Só para leitura, não há o que cancelar: o botão só fecha. */}
          <Button type="button" variant="outline" onClick={close}>
            {readOnly ? t('comum:acoes.fechar') : t('comum:acoes.cancelar')}
          </Button>
          {!readOnly && (
            <Button
              type="button"
              disabled={loading || isSubmitting}
              onClick={() => {
                void handleSubmit(save)();
              }}
            >
              <Check aria-hidden="true" />
              {t('painelControle:confirmar')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
