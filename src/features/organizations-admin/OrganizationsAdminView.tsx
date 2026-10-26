import { useId, useState } from 'react';
import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-dark.svg';
import {
  Info,
  LogOut,
  LayoutDashboard,
  ClipboardPen,
  ChevronDown,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CompanyTable, type Empresa } from './components/CompanyTable';

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

export function OrganizationsAdminView() {
  const { t } = useTranslation(['formulario', 'empresas']);

  const [empresas, setEmpresas] = useState<Empresa[]>(empresasIniciais);
  const [empresasAbertas, setEmpresasAbertas] = useState(true);
  const conteudoId = useId();

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
    <div className="flex min-h-svh flex-col bg-background">
      {/* CABEÇALHO: TÍTULO À ESQUERDA E LOGO/ÍCONES À DIREITA */}
      <header className="flex w-full flex-col items-start justify-between gap-6 px-6 py-8 sm:flex-row sm:items-center sm:px-10">
        <section className="flex flex-col gap-1">
          <p className="text-brand text-sm font-bold tracking-widest uppercase">
            Administradora
          </p>

          <h1 className="text-3xl font-bold text-heading">
            Painel de controle
          </h1>

          <p className="text-sm text-muted-foreground">
            Aqui está o panorama do CREED hoje.
          </p>
        </section>

        <div className="flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-border bg-background p-2">
          <button
            type="button"
            aria-label={t('formulario:menuPainel')}
            className="text-brand p-2 transition-colors hover:opacity-80"
          >
            <LayoutDashboard size={24} />
          </button>

          <button
            type="button"
            aria-label={t('formulario:menuFormulario')}
            className="text-brand p-2 transition-colors hover:opacity-80"
          >
            <ClipboardPen size={24} />
          </button>

          <button
            type="button"
            aria-label={t('formulario:menuInformacoes')}
            className="text-brand p-2 transition-colors hover:opacity-80"
          >
            <Info size={24} />
          </button>

          <CreedSymbol className="size-6" />

          <img src={wordmark} alt="CREED.ai" className="w-24" />

          <button
            type="button"
            aria-label={t('formulario:menuSair')}
            className="text-brand p-2 transition-colors hover:opacity-80"
          >
            <LogOut size={24} />
          </button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex flex-1 flex-col gap-8 px-6 pb-10 sm:px-10">
        {/* SEÇÃO RECOLHÍVEL: EMPRESAS */}
        <section className="w-full md:w-1/2">
          <button
            type="button"
            onClick={() => {
              setEmpresasAbertas((aberta) => !aberta);
            }}
            aria-expanded={empresasAbertas}
            aria-controls={conteudoId}
            className="flex w-full items-center gap-3 text-left text-heading"
          >
            <ChevronDown
              size={20}
              className={`shrink-0 transition-transform duration-200 ${
                empresasAbertas ? 'rotate-0' : '-rotate-90'
              }`}
            />

            <h2 className="text-xl font-bold">Empresas</h2>

            <div className="h-px flex-1 bg-primary" />
          </button>

          {empresasAbertas && (
            <div id={conteudoId} className="mt-4 w-full">
              <CompanyTable
                empresas={empresas}
                onVerResultados={handleVerResultados}
                onExcluir={handleExcluir}
                onAceitar={handleAceitar}
                onRejeitar={handleRejeitar}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
