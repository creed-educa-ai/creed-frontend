import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Info,
  LogOut,
  LayoutDashboard,
  ClipboardPen,
  ChevronDown,
} from 'lucide-react';
import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-dark.svg';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardHeaderProps {
  organizationName: string;
  // Filtros de cada tela; o botão de baixar é comum e vem depois deles.
  filters: ReactNode;
}

export function DashboardHeader({
  organizationName,
  filters,
}: DashboardHeaderProps) {
  const { t } = useTranslation(['formulario', 'dashboard']);

  return (
    <header className="flex w-full flex-col items-center justify-center gap-4 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-sm font-bold text-heading">{organizationName}</p>
        <h1 className="text-center text-3xl font-bold text-heading sm:text-left">
          Dashboard
        </h1>
      </div>

      {/* BOTÕES DE AÇÃO */}
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-background p-2 sm:justify-end">
        {filters}

        {/* BAIXAR */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="default" className="gap-2">
              <ChevronDown />
              {t('dashboard:Baixar')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onSelect={() => {
                window.print();
              }}
            >
              PDF
            </DropdownMenuItem>
            {/* TODO: IMPLEMENTAR LOGICA DE DOWNLOAD DE CSV */}
            <DropdownMenuItem>CSV</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
  );
}
