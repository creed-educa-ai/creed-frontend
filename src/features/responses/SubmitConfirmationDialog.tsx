import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface SubmitConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

// Confirmação do envio das respostas, no fim da revisão do questionário.
export function SubmitConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
}: SubmitConfirmationDialogProps) {
  const { t } = useTranslation(['questionarioRevisao']);
  const confirmarRef = useRef<HTMLButtonElement>(null);
  const [destacarConfirmar, setDestacarConfirmar] = useState(false);

  // Clique fora ou Esc não fecham: o foco vai para "Confirmar envio", com o
  // anel de foco, como nos outros modais obrigatórios. Cancelar continua
  // fechando pelo próprio botão.
  const chamarAtencao = () => {
    confirmarRef.current?.focus();
    setDestacarConfirmar(true);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        onOverlayClick={chamarAtencao}
        onEscapeKeyDown={(event) => {
          event.preventDefault();
          chamarAtencao();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('questionarioRevisao:confirmarEnvioTitulo')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('questionarioRevisao:confirmarEnvioDescricao')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {t('questionarioRevisao:cancelar')}
          </AlertDialogCancel>
          <AlertDialogAction
            ref={confirmarRef}
            onBlur={() => {
              setDestacarConfirmar(false);
            }}
            className={cn(
              destacarConfirmar && 'border-ring ring-3 ring-ring/50',
            )}
            onClick={(event) => {
              // Quem fecha é o envio (`onConfirm`), não o clique: assim o
              // diálogo não some antes de o envio começar.
              event.preventDefault();
              onConfirm();
            }}
          >
            {t('questionarioRevisao:confirmarEnvio')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
