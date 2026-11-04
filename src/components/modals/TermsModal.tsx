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

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  // Aceitar e recusar chamam onOpenChange(false): quem precisa reagir à
  // recusa (ex.: deslogar) não distingue as duas por ali.
  onDecline?: () => void;
}

export function TermsModal({
  open,
  onOpenChange,
  onAccept,
  onDecline,
}: TermsModalProps) {
  const { t } = useTranslation(['termo']);
  const aceitarRef = useRef<HTMLButtonElement>(null);
  const [destacarAceitar, setDestacarAceitar] = useState(false);

  const handleAccept = () => {
    onOpenChange(false);
    onAccept();
  };

  const handleDecline = () => {
    onOpenChange(false);
    onDecline?.();
  };

  // Clique fora ou Esc não fecham o termo: o foco vai para "Aceitar", com o
  // anel de foco, mostrando que é preciso escolher (como no InfoModal).
  const chamarAtencao = () => {
    aceitarRef.current?.focus();
    setDestacarAceitar(true);
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        // Impede o fechamento por clique fora ou outras ações.
        // O modal só fecha através de Aceitar ou Recusar.
        if (nextOpen) {
          onOpenChange(true);
        }
      }}
    >
      {/* O texto do termo é longo: a largura sobe pela mesma variante do
          tamanho padrão, que é a que o tailwind-merge substitui. */}
      <AlertDialogContent
        className="data-[size=default]:sm:max-w-2xl"
        onOverlayClick={chamarAtencao}
        onEscapeKeyDown={(event) => {
          event.preventDefault();
          chamarAtencao();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{t('termo:titulo')}</AlertDialogTitle>
        </AlertDialogHeader>

        {/* Área com scroll para o texto dos termos */}
        <AlertDialogDescription asChild>
          <div className="max-h-80 overflow-y-auto rounded-lg border border-border bg-card p-4">
            <p className="text-sm leading-relaxed whitespace-pre-line text-card-foreground">
              {t('termo:corpo')}
            </p>
          </div>
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDecline}>
            {t('termo:recusar')}
          </AlertDialogCancel>
          <AlertDialogAction
            ref={aceitarRef}
            onClick={handleAccept}
            onBlur={() => {
              setDestacarAceitar(false);
            }}
            className={cn(destacarAceitar && 'border-ring ring-3 ring-ring/50')}
          >
            {t('termo:aceitar')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
