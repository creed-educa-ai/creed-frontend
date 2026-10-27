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

interface ConfirmDeleteDialogProps {
  open: boolean;
  title: string;
  description: string;
  // Mensagem se a exclusão falhar; o padrão é genérico.
  errorMessage?: string;
  // Pode devolver uma promessa: o diálogo espera por ela para fechar. Se for
  // rejeitada, mostra o erro e continua aberto para tentar de novo.
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

// Confirmação de exclusão, igual em todas as tabelas.
export function ConfirmDeleteDialog({
  open,
  title,
  description,
  errorMessage,
  onConfirm,
  onClose,
}: ConfirmDeleteDialogProps) {
  const { t } = useTranslation(['comum']);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [highlightCancel, setHighlightCancel] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [failed, setFailed] = useState(false);

  function close() {
    setHighlightCancel(false);
    setFailed(false);
    onClose();
  }

  // Modal obrigatório (ver ui-e-responsividade.md): Esc e clique fora não
  // fecham. O foco vai para "Cancelar" e o botão ganha o anel de foco, mostrando
  // que é preciso escolher uma das opções.
  // > 🟡 Premissa — a convenção manda destacar "a ação principal". Aqui o
  // > destaque vai para Cancelar, a ação menos destrutiva: assim um Enter logo
  // > depois não exclui ninguém.
  function drawAttention() {
    cancelRef.current?.focus();
    setHighlightCancel(true);
  }

  async function confirm() {
    if (deleting) return;
    setDeleting(true);
    setFailed(false);
    try {
      await onConfirm();
      close();
    } catch {
      setFailed(true);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        onOverlayClick={drawAttention}
        onEscapeKeyDown={(event) => {
          event.preventDefault();
          drawAttention();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {failed && (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage ?? t('comum:tabela.erroExcluir')}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel
            ref={cancelRef}
            disabled={deleting}
            className={cn(highlightCancel && 'border-ring ring-3 ring-ring/50')}
            onBlur={() => {
              setHighlightCancel(false);
            }}
            onClick={close}
          >
            {t('comum:acoes.cancelar')}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive-solid"
            disabled={deleting}
            onClick={(event) => {
              event.preventDefault();
              void confirm();
            }}
          >
            {deleting ? t('comum:tabela.excluindo') : t('comum:tabela.excluir')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
