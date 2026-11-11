import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmDeleteDialog } from '@/components/table/confirmDeleteDialog';
import { Button } from '@/components/ui/button';
import type { OrganizationResponse } from '@/types/api';

interface CompanyApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa: OrganizationResponse | null;
  onAccept: () => void;
  onReject: () => void;
}

interface CampoProps {
  rotulo: string;
  // Nulo nas organizações criadas sem o cadastro público.
  valor: string | null;
}

function Campo({ rotulo, valor }: CampoProps) {
  return (
    <div>
      <p className="font-bold">{rotulo}</p>
      <p className="break-words">{valor ?? '—'}</p>
    </div>
  );
}

export function CompanyApprovalModal({
  open,
  onOpenChange,
  empresa,
  onAccept,
  onReject,
}: CompanyApprovalModalProps) {
  const { t } = useTranslation(['aceite', 'cadastro']);
  // Rejeitar é destrutivo: passa por uma confirmação por cima deste modal.
  // Cancelar ali volta para os dados da empresa.
  const [confirmandoRejeicao, setConfirmandoRejeicao] = useState(false);

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('aceite:titulo')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Campo
            rotulo={t('cadastro:campos.nomeEmpresa.rotulo')}
            valor={empresa.name}
          />
          <Campo
            rotulo={t('cadastro:campos.documento.rotulo')}
            valor={empresa.document.value}
          />
          <Campo
            rotulo={t('cadastro:campos.email.rotulo')}
            valor={empresa.email}
          />
          <Campo
            rotulo={t('aceite:responsavel')}
            valor={empresa.contact_name}
          />
          <Campo
            rotulo={t('cadastro:campos.telefone.rotulo')}
            valor={empresa.phone}
          />
        </div>

        <DialogFooter>
          <Button
            variant="destructive-solid"
            onClick={() => {
              setConfirmandoRejeicao(true);
            }}
          >
            {t('aceite:rejeitar')}
          </Button>
          <Button onClick={handleAccept}>{t('aceite:aceitar')}</Button>
        </DialogFooter>
      </DialogContent>

      <ConfirmDeleteDialog
        open={confirmandoRejeicao}
        title={t('aceite:rejeitarConfirmacao.titulo')}
        description={t('aceite:rejeitarConfirmacao.descricao', {
          nome: empresa.name,
        })}
        confirmLabel={t('aceite:rejeitar')}
        pendingLabel={t('aceite:rejeitarConfirmacao.rejeitando')}
        onConfirm={handleReject}
        onClose={() => {
          setConfirmandoRejeicao(false);
        }}
      />
    </Dialog>
  );
}
