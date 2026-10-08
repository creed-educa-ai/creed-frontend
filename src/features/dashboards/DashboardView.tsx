import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-dark.svg';
import { Info, LogOut, LayoutDashboard, ClipboardPen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ResultadoText } from './ResultadoText';

export function DashboardView() {
  const { t } = useTranslation(['formulario']);

  return (
    <div className="flex min-h-svh flex-col overflow-hidden bg-background">
      <header className="flex w-full flex-col items-center justify-center gap-4 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-heading">João Silva</p>
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
      {/* BOTÃO DE TOGGLE APENAS PARA TESTES*/}
      <button className="mb-4 max-w-40 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/80">
        Toggle empresa
      </button>
      <ResultadoText
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
    </div>
  );
}
