import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { CompanyTable } from '@/features/organizations/CompanyTable';
import {
  approveCompany,
  deleteCompany,
  loadCompanies,
  rejectCompany,
} from '@/features/organizations/organizationsSlice';
import type { Company } from '@/types/api';

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
    await dispatch(deleteCompany(id)).unwrap();
  }

  const handleAceitar = (empresa: Company) => {
    void dispatch(approveCompany(empresa.id));
  };

  const handleRejeitar = (empresa: Company) => {
    void dispatch(rejectCompany(empresa.id));
  };

  return (
    // O card é a seção: o título fica dentro dele, como nos cards do
    // dashboard. O separador ("Membros") é do painel.
    <section className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-sm">
      <h3 className="text-xl font-bold text-heading">{t('empresas:titulo')}</h3>
      {status === 'loading' && (
        <div className="space-y-3" aria-live="polite">
          <p className="text-sm text-muted-foreground">{t('carregando')}</p>
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {status === 'error' && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive"
        >
          {error && t(error)} {t('tenteRecarregar')}
        </p>
      )}

      {status === 'ready' && (
        <CompanyTable
          empresas={companies}
          onVerResultados={handleVerResultados}
          onExcluir={handleExcluir}
          onAceitar={handleAceitar}
          onRejeitar={handleRejeitar}
        />
      )}
    </section>
  );
}
