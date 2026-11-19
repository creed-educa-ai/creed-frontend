import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  QuestionAnswerEditor,
  type QuestionType,
} from '@/features/responses/Question';

interface EditAnswerDialogProps {
  open: boolean;
  onClose: () => void;
  // A pergunta aberta. Fica opcional porque o diálogo continua montado
  // enquanto fecha, e aí já não há pergunta ativa.
  question: { text: string; type: QuestionType; options: string[] } | null;
  questionNumber: number;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
}

// Modal comum da revisão do questionário: muda a resposta de uma pergunta sem
// voltar ao fluxo. Fecha clicando fora, como todo modal comum.
export function EditAnswerDialog({
  open,
  onClose,
  question,
  questionNumber,
  value,
  onChange,
  onSave,
}: EditAnswerDialogProps) {
  const { t } = useTranslation(['questionarioRevisao', 'formulario']);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        {question && (
          <>
            <DialogHeader>
              <DialogTitle>
                {t('questionarioRevisao:modalTitulo', {
                  numero: questionNumber,
                })}
              </DialogTitle>
              <DialogDescription>{question.text}</DialogDescription>
            </DialogHeader>
            <QuestionAnswerEditor
              tipo={question.type}
              opcoes={question.options}
              valor={value}
              placeholder={t('formulario:textbox')}
              onMudar={onChange}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t('questionarioRevisao:cancelar')}
              </Button>
              <Button type="button" onClick={onSave}>
                {t('questionarioRevisao:salvarResposta')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
