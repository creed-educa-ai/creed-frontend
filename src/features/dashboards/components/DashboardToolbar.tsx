import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardToolbarProps {
  // Filtros de cada tela; o botão de baixar é comum e fica à direita.
  filters: ReactNode;
}

// Barra entre o header e o conteúdo: os filtros valem para a página inteira,
// então ficam acima de tudo o que eles mudam, e não no header.
export function DashboardToolbar({ filters }: DashboardToolbarProps) {
  const { t } = useTranslation(['dashboard']);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">{filters}</div>

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
  );
}
