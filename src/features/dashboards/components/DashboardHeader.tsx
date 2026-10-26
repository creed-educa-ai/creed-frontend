import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { NavMenu } from '@/components/layout/navMenu';
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
  // Só a empresa vê o atalho para o painel de controle no menu.
  showControlPanel?: boolean;
}

export function DashboardHeader({
  organizationName,
  filters,
  showControlPanel = false,
}: DashboardHeaderProps) {
  const { t } = useTranslation(['dashboard']);

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

      <NavMenu active="dashboard" showControlPanel={showControlPanel} />
    </header>
  );
}
