import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface EmpresaPendente {
  nomeEmpresa: string;
  documento: string;
  email: string;
  nomeResponsavel: string; // quem fez o cadastro da empresa
  telefone: string;
}

interface ModalAceiteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa: EmpresaPendente | null;
  onAccept: () => void;
  onReject: () => void;
}

interface CampoProps {
  rotulo: string;
  valor: string;
}

function Campo({ rotulo, valor }: CampoProps) {
  return (
    <div>
      <p className="font-bold">{rotulo}</p>
      <p className="break-words">{valor}</p>
    </div>
  );
}

export function ModalAceite({
  open,
  onOpenChange,
  empresa,
  onAccept,
  onReject,
}: ModalAceiteProps) {
  const { t } = useTranslation(['aceite', 'cadastro']);

  if (!empresa) return null;

  const handleAccept = () => {
    onOpenChange(false);
    onAccept();
  };

  const handleReject = () => {
    onOpenChange(false);
    onReject();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background">
        <DialogHeader>
          <DialogTitle>{t('aceite:titulo')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Campo
            rotulo={t('cadastro:campos.nomeEmpresa.rotulo')}
            valor={empresa.nomeEmpresa}
          />
          <Campo
            rotulo={t('cadastro:campos.documento.rotulo')}
            valor={empresa.documento}
          />
          <Campo
            rotulo={t('cadastro:campos.email.rotulo')}
            valor={empresa.email}
          />
          <Campo
            rotulo={t('aceite:responsavel')}
            valor={empresa.nomeResponsavel}
          />
          <Campo
            rotulo={t('cadastro:campos.telefone.rotulo')}
            valor={empresa.telefone}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleReject}>
            {t('aceite:rejeitar')}
          </Button>
          <Button onClick={handleAccept}>{t('aceite:aceitar')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
