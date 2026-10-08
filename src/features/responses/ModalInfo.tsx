import { useRef, useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface ModalInfoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReview: () => void;
  onStart: () => void;
}

export function ModalInfo({
  open,
  onOpenChange,
  onReview,
  onStart,
}: ModalInfoProps) {
  const { t } = useTranslation(['onboardQuestionarioInfo']);
  const iniciarRef = useRef<HTMLButtonElement>(null);
  const [destacarIniciar, setDestacarIniciar] = useState(false);

  const handleReview = () => {
    onOpenChange(false);
    onReview();
  };

  const handleStart = () => {
    onOpenChange(false);
    onStart();
  };

  // Clique fora ou Esc não fecham o modal: em vez disso, o foco vai para
  // "Iniciar questionário" e o botão ganha o anel de foco, mostrando que é
  // preciso escolher uma das opções.
  const chamarAtencao = () => {
    iniciarRef.current?.focus();
    setDestacarIniciar(true);
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        // O modal só fecha pelos botões.
        if (nextOpen) {
          onOpenChange(true);
        }
      }}
    >
      {/* Mesmo visual do "confirmar envio" da revisão: é o padrão dos
          modais obrigatórios, para não confundir com os modais comuns. */}
      <AlertDialogContent
        onOverlayClick={chamarAtencao}
        onEscapeKeyDown={(event) => {
          event.preventDefault();
          chamarAtencao();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('onboardQuestionarioInfo:titulo')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('onboardQuestionarioInfo:mensagem')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleReview}>
            {t('onboardQuestionarioInfo:revisarDados')}
          </AlertDialogCancel>
          <AlertDialogAction
            ref={iniciarRef}
            onClick={handleStart}
            onBlur={() => {
              setDestacarIniciar(false);
            }}
            className={cn(destacarIniciar && 'border-ring ring-3 ring-ring/50')}
          >
            {t('onboardQuestionarioInfo:iniciarQuestionario')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
