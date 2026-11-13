import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { CompanyTable } from '@/features/organizations/CompanyTable';
import {
  approveOrganization,
  deleteOrganization,
  loadOrganizations,
  NAO_APROVADA,
} from '@/features/organizations/organizationsSlice';
import type { OrganizationResponse } from '@/types/api';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { cardTitleClassName } from '@/lib/typography';

// Seção "Empresas" do painel da administradora: lista as organizações e trata
// o aceite das pendentes e a exclusão. Cobre os estados de carregando, erro e
// pronto.
export function CompaniesSection() {
  const { t } = useTranslation(['comum', 'empresas']);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { organizations, status, error } = useAppSelector(
    (state) => state.organizations,
  );
  const organizacaoDaSessao = useAppSelector(
    (state) => state.authentication.user?.organization_id,
  );

  useEffect(() => {
    void dispatch(loadOrganizations());
  }, [dispatch]);

  // 🟡 Premissa P-081 — a tabela não mostra a organização da sessão (a da
  // CREED). Sem `organization_id` na sessão, nada sai da lista, e o back
  // continua recusando excluí-la (409).
  const empresas = organizations.filter(
    (organization) => organization.id !== organizacaoDaSessao,
  );

  // O dashboard da administradora, já com a empresa escolhida.
  const handleVerResultados = (id: string) => {
    navigate(`/dashboard/company?organization_id=${encodeURIComponent(id)}`);
  };

  // A falha vira toast, e a promessa resolve mesmo assim: o diálogo de
  // confirmação fecha, em vez de mostrar o erro dele junto com o toast. A linha
  // continua na tabela, porque o slice só a tira no sucesso.
  async function handleExcluir(id: string) {
    const nome = organizations.find((empresa) => empresa.id === id)?.name ?? '';
    try {
      await dispatch(deleteOrganization(id)).unwrap();
      toast.success(t('empresas:toasts.excluida'), {
        description: t('empresas:toasts.excluidaDescricao', { nome }),
      });
    } catch {
      toast.error(t('empresas:toasts.erroExcluir'), {
        description: t('tenteNovamenteEmInstantes'),
      });
    }
  }

  // Aceitar e rejeitar saem do modal de aceite, que já fechou: o toast é o
  // único retorno da ação, no sucesso e na falha.
  async function handleAceitar(empresa: OrganizationResponse) {
    try {
      await dispatch(approveOrganization(empresa.id)).unwrap();
      // 🟡 Premissa P-053 — o convite de gestor vai ao e-mail do cadastro.
      toast.success(t('empresas:toasts.aprovada'), {
        description: t('empresas:toasts.aprovadaDescricao', {
          nome: empresa.name,
        }),
      });
    } catch (chave) {
      const descricao =
        typeof chave === 'string' ? chave : 'comum:tenteNovamenteEmInstantes';
      toast.error(t('empresas:toasts.erroAprovar'), {
        description: t(descricao as never),
      });
      // Outra pessoa pode ter aprovado antes: a lista da tela está velha.
      if (chave === NAO_APROVADA) {
        void dispatch(loadOrganizations());
      }
    }
  }

  // Rejeitar é excluir a pendente (P-078).
  async function handleRejeitar(empresa: OrganizationResponse) {
    try {
      await dispatch(deleteOrganization(empresa.id)).unwrap();
      toast.success(t('empresas:toasts.rejeitada'), {
        description: t('empresas:toasts.rejeitadaDescricao', {
          nome: empresa.name,
        }),
      });
    } catch {
      toast.error(t('empresas:toasts.erroRejeitar'), {
        description: t('tenteNovamenteEmInstantes'),
      });
    }
  }

  return (
    // O card é a seção: o título fica dentro dele, como nos cards do
    // dashboard. O separador ("Membros") é do painel.
    <Card asChild>
      <section>
        <CardContent className="flex flex-col gap-4">
          <h3 className={cardTitleClassName}>{t('empresas:titulo')}</h3>
          {status === 'loading' && (
            <LoadingState>
              <Skeleton className="h-40 w-full" />
            </LoadingState>
          )}

          {status === 'error' && <ErrorState message={error && t(error)} />}

          {status === 'ready' && (
            <CompanyTable
              empresas={empresas}
              onVerResultados={handleVerResultados}
              onExcluir={handleExcluir}
              onAceitar={(empresa) => {
                void handleAceitar(empresa);
              }}
              onRejeitar={(empresa) => {
                void handleRejeitar(empresa);
              }}
            />
          )}
        </CardContent>
      </section>
    </Card>
  );
}
