import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
// MockData é só para desenvolvimento e teste local, não deve ser usado em produção.
import { getData } from './MockData';
import * as XLSX from 'xlsx';
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

  //O MockData é só para desenvolvimento e teste local, não deve ser usado em produção.
  const [data] = useState(getData());
  const handleOnExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dashboard');
    XLSX.writeFile(workbook, 'dashboard.csv');
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">{filters}</div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="default">
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
          <DropdownMenuItem onClick={handleOnExport}>CSV</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
