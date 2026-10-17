import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-dark.svg';
import { useTranslation } from 'react-i18next';
import { MetricasCard } from './components/MetricasCard';
import {
  PRISMA_DIMENSIONS,
  PrismaRadarChart,
  type PrismaPeriod,
  type PrismaScores,
} from './components/PrismaRadarChart';
import { ResultadoText } from './components/ResultadoText';
import { ResumoCards } from './components/ResumoCards';
import { useId, useState, type ReactNode } from 'react';
import {
  ChevronDown,
  Info,
  LogOut,
  LayoutDashboard,
  ClipboardPen,
} from 'lucide-react';

// Dados fictícios: depois entram os dados do back.
const NOME_EMPRESA = 'Acme Inc.';

const periodoAtual: PrismaPeriod = {
  label: '2026/1',
  scores: {
    plasticidade_humana: 79,
    tomada_decisao: 77,
    empreendedorismo: 67,
    multiculturalismo: 57,
    neuroinovacao: 54,
  },
};

const periodoAnterior: PrismaPeriod = {
  label: '2025/2',
  scores: {
    plasticidade_humana: 70,
    tomada_decisao: 72,
    empreendedorismo: 60,
    multiculturalismo: 52,
    neuroinovacao: 48,
  },
};

function SecaoRecolhivel({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const conteudoId = useId();

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
          }}
          aria-expanded={isOpen}
          aria-controls={conteudoId}
          className="flex cursor-pointer items-center gap-2 text-heading"
        >
          <ChevronDown
            size={20}
            className={`transition-transform duration-200 ${
              isOpen ? 'rotate-0' : '-rotate-90'
            }`}
          />
          <h2 className="text-xl font-bold">{titulo}</h2>
        </button>
        <div className="h-px flex-1 bg-primary" aria-hidden="true" />
      </div>

      {isOpen && <div id={conteudoId}>{children}</div>}
    </section>
  );
}

export function DashboardView() {
  const { t } = useTranslation(['formulario', 'dashboardPrisma', 'resultado']);
  const [empresa, setEmpresa] = useState(false);

  // Transforma as notas do prisma na lista que o MetricasCard espera.
  const montarMetricas = (scores: PrismaScores) =>
    PRISMA_DIMENSIONS.map((dimension) => ({
      nome: t(`dashboardPrisma:dimensoes.${dimension}`),
      valor: scores[dimension],
    }));

  return (
    <div className="flex min-h-svh flex-col overflow-hidden bg-background">
      <header className="flex w-full flex-col items-center justify-center gap-4 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-heading">{NOME_EMPRESA}</p>
          <h1 className="text-center text-3xl font-bold text-heading sm:text-left">
            Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-border bg-background p-2 sm:justify-end">
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

      {/* BOTÃO DE TOGGLE APENAS PARA TESTES */}
      <button
        type="button"
        aria-pressed={empresa}
        onClick={() => {
          setEmpresa((prev) => !prev);
        }}
        className="mx-6 mb-4 max-w-40 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/80"
      >
        Toggle empresa
      </button>

      <main className="flex flex-col gap-8 px-6 pb-10">
        {empresa && (
          <ResumoCards
            nomeEmpresa={NOME_EMPRESA}
            concluidos={50}
            convidados={67}
            destaque={{
              titulo: 'Inovação',
              valor: 79,
              descricao:
                'A equipe demonstra abertura consistente a novas abordagens e experimentação em ciclos curtos.',
            }}
            oportunidade={{
              titulo: 'Neuroinovação',
              valor: 54,
              descricao:
                'A equipe demonstra abertura consistente a novas abordagens e experimentação em ciclos curtos.',
            }}
            maisComum={{
              titulo: 'Cultura',
              valor: 67,
              descricao:
                'A equipe demonstra abertura consistente a novas abordagens e experimentação em ciclos curtos.',
            }}
          />
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
          {/* COLUNA ESQUERDA: DADOS DE VISÃO GERAL */}
          <SecaoRecolhivel titulo={t('resultado:dadosVisaoGeral')}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <PrismaRadarChart current={periodoAtual} compact />
              <MetricasCard metricas={montarMetricas(periodoAtual.scores)} />

              <MetricasCard
                titulo={t('resultado:evolucao')}
                metricas={montarMetricas(periodoAtual.scores)}
              />
              <PrismaRadarChart
                current={periodoAtual}
                previous={periodoAnterior}
                compact
              />
            </div>
          </SecaoRecolhivel>

          {/* COLUNA DIREITA: RESUMO EM TEXTO */}
          <section>
            <ResultadoText
              compacto
              empresa={empresa}
              destaqueTexto="Lorem ipsum dolor sit amet consectetur adipisicing elit."
              oportunidadeTexto="Lorem ipsum dolor sit amet consectetur adipisicing elit."
              analiseTexto={[
                'Primeiro parágrafo da análise.',
                'Segundo parágrafo da análise.',
              ]}
              recomendacaoTexto={[
                'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
              ]}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
