import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

export function TermoModal({ open, onOpenChange, onAccept }: TermsModalProps) {
  const { t } = useTranslation(['termo']);

  const handleAccept = () => {
    onOpenChange(false);
    onAccept();
  };

  const handleDecline = () => {
    onOpenChange(false);
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
      <AlertDialogContent className="w-full !max-w-2xl bg-background">
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

        {/* Botões */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleDecline}>
            {t('termo:recusar')}
          </Button>

          <AlertDialogAction onClick={handleAccept}>
            {t('termo:aceitar')}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
