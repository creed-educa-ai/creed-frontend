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
}

export function ModalInfo({ open, onOpenChange }: ModalInfoProps) {
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
            <Button variant="outline">{t('info:yes')}</Button>
            {/* botão de não deve navegar ao questionário em si quando for adicionado*/}
            <Button className="bg-brand text-primary-foreground">
              {t('info:no')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
