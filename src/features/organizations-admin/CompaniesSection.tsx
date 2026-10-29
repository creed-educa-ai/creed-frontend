import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '@/components/layout/sectionHeader';
import {
  CompanyTable,
  type Empresa,
} from '@/features/organizations-admin/components/CompanyTable';

// Dados fictícios até a integração com o backend.
const empresasIniciais: Empresa[] = [
  {
    id: '1',
    nomeEmpresa: 'Acme Inc.',
    email: 'contato@acme.com',
    status: 'pendente',
    documento: '345645678',
    nomeResponsavel: 'Ana Silva',
    telefone: '11987654321',
  },
  {
    id: '2',
    nomeEmpresa: 'Tech Solutions',
    email: 'contato@techsolutions.com',
    status: 'ativo',
    documento: '34567890',
    nomeResponsavel: 'Carlos Oliveira',
    telefone: '11987654321',
  },
  {
    id: '3',
    nomeEmpresa: 'Inova Tech',
    email: 'contato@inovatech.com',
    status: 'pendente',
    documento: '34567891',
    nomeResponsavel: 'Maria Santos',
    telefone: '11987654321',
  },
];

// Seção "Empresas" do painel do super adm: lista as empresas e trata o aceite
// das pendentes.
export function CompaniesSection() {
  const { t } = useTranslation(['empresas']);
  const [empresas, setEmpresas] = useState<Empresa[]>(empresasIniciais);

  const handleVerResultados = (id: string) => {
    console.log('Ver resultados da empresa:', id);
  };

  const handleExcluir = (id: string) => {
    setEmpresas((atuais) => atuais.filter((empresa) => empresa.id !== id));
  };

  const handleAceitar = (empresa: Empresa) => {
    setEmpresas((atuais) =>
      atuais.map((item) =>
        item.id === empresa.id ? { ...item, status: 'ativo' } : item,
      ),
    );
  };

  const handleRejeitar = (empresa: Empresa) => {
    setEmpresas((atuais) => atuais.filter((item) => item.id !== empresa.id));
  };

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader>{t('empresas:titulo')}</SectionHeader>
      <div className="flex-1 rounded-3xl bg-card p-6 shadow-sm">
        <CompanyTable
          empresas={empresas}
          onVerResultados={handleVerResultados}
          onExcluir={handleExcluir}
          onAceitar={handleAceitar}
          onRejeitar={handleRejeitar}
        />
      </div>
    </section>
  );
}
