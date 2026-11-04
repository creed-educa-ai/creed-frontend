import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { CompanyTable } from '@/features/organizations/CompanyTable';
import {
  approveCompany,
  deleteCompany,
  loadCompanies,
  rejectCompany,
} from '@/features/organizations/organizationsSlice';
import type { Company } from '@/types/api';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { cardTitleClassName } from '@/lib/typography';

// Seção "Empresas" do painel do super adm: lista as empresas e trata o aceite
// das pendentes. Cobre os estados de carregando, erro e pronto.
export function CompaniesSection() {
  const { t } = useTranslation(['comum', 'empresas']);
  const dispatch = useAppDispatch();
  const { companies, status, error } = useAppSelector(
    (state) => state.organizations,
  );

  useEffect(() => {
    void dispatch(loadCompanies());
  }, [dispatch]);

  const handleVerResultados = (id: string) => {
    console.log('Ver resultados da empresa:', id);
  };

  async function handleExcluir(id: string) {
    const nome =
      companies.find((empresa) => empresa.id === id)?.nomeEmpresa ?? '';
    await dispatch(deleteCompany(id)).unwrap();
    toast.success(t('empresas:toasts.excluida'), {
      description: t('empresas:toasts.excluidaDescricao', { nome }),
    });
  }

  // Aceitar e rejeitar saem do modal de aceite, que já fechou: o toast é o
  // único retorno da ação, no sucesso e na falha.
  async function handleAceitar(empresa: Company) {
    try {
      await dispatch(approveCompany(empresa.id)).unwrap();
      toast.success(t('empresas:toasts.aprovada'), {
        description: t('empresas:toasts.aprovadaDescricao', {
          nome: empresa.nomeEmpresa,
        }),
      });
    } catch {
      toast.error(t('empresas:toasts.erroAprovar'), {
        description: t('tenteNovamenteEmInstantes'),
      });
    }
  }

  async function handleRejeitar(empresa: Company) {
    try {
      await dispatch(rejectCompany(empresa.id)).unwrap();
      toast.success(t('empresas:toasts.rejeitada'), {
        description: t('empresas:toasts.rejeitadaDescricao', {
          nome: empresa.nomeEmpresa,
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
              empresas={companies}
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
