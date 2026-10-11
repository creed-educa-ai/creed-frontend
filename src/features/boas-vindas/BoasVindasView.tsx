import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { AuthLayout } from '@/components/layout/authLayout';
import { useNavigate } from 'react-router-dom';
import { ModalContato } from '@/components/modals/ModalContato';
import { useState } from 'react';

export function BoasVindasView() {
  // Os namespaces usados na tela precisam ser declarados aqui: é o que dá o
  // autocomplete das chaves. O primeiro é o padrão para chaves sem prefixo.
  const { t } = useTranslation(['boasVindas']);
  const navigate = useNavigate();
  const [contatoAberto, setContatoAberto] = useState(false);

  return (
    <AuthLayout titulo={t('boasVindas:tagline')}>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold text-heading">
            {t('boasVindas:titulo')}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {t('boasVindas:apresentacao')}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-muted-foreground">
            {t('boasVindas:entrar.chamada')}
          </p>
          <Button
            variant="default"
            onClick={() => {
              navigate('/login');
            }}
          >
            {t('boasVindas:entrar.acao')}
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-muted-foreground">
            {t('boasVindas:criarConta.chamada')}
          </p>
          <Button
            variant="default"
            onClick={() => {
              navigate('/cadastro');
            }}
          >
            {t('boasVindas:criarConta.acao')}
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={() => {
              navigate('/sobre');
            }}
          >
            {t('boasVindas:saibaMais')}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setContatoAberto(true);
            }}
          >
            {t('boasVindas:faleConosco')}
          </Button>
        </div>
      </div>
      <ModalContato open={contatoAberto} onOpenChange={setContatoAberto} />
    </AuthLayout>
  );
}
