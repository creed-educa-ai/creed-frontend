import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

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
  const { t } = useTranslation(['info']);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background">
        <DialogHeader>
          <DialogTitle>{t('info:titulo')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="font-bold">{t('info:mensagem')}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onReview();
              }}
            >
              {t('info:yes')}
            </Button>
            {/* botão "não" deve navegar ao questionário em si quando for adicionado*/}
            <Button
              className="bg-brand text-primary-foreground"
              onClick={() => {
                onStart();
              }}
            >
              {t('info:no')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
