import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';

interface ModalContatoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModalContato({ open, onOpenChange }: ModalContatoProps) {
  const { t } = useTranslation(['contato']);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background">
        <DialogHeader>
          <DialogTitle>{t('contato:titulo')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="font-bold">Naira Maria Lobraico Libermann</p>
          </div>

          <div>
            <p className="font-bold">{t('contato:email')}</p>
            <p>naira.libermann@gmail.com</p>
          </div>
          <div>
            <p className="font-bold">{t('contato:telefone')}</p>
            <p>+55 (51) 9961.4494</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
