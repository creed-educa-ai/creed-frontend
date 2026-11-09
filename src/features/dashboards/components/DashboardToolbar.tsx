import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mocks para desenvolvimento e teste local.
import { getData } from './MockData_RespForm';
import { getDataPrismas } from './MockData_Prisma';

import * as XLSX from 'xlsx';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardToolbarProps {
  filters: ReactNode;
}

export function DashboardToolbar({ filters }: DashboardToolbarProps) {
  const { t } = useTranslation(['dashboard']);

  // Dados mockados para desenvolvimento.
  const [data] = useState(getData());
  const [dataPrismas] = useState(getDataPrismas());

  const handleOnExport = () => {
    // Converte os dados para CSV.
    const generateCsv = (rows: Record<string, unknown>[]) => {
      const worksheet = XLSX.utils.json_to_sheet(rows);

      const csv = XLSX.utils.sheet_to_csv(worksheet, {
        FS: ';',
        RS: '\r\n',
      });

      // BOM para preservar caracteres especiais no Excel.
      return new Blob(['\uFEFF' + csv], {
        type: 'text/csv;charset=utf-8;',
      });
    };

    // Gera os dois arquivos.
    const blobDashboard = generateCsv(data);
    const blobPrismas = generateCsv(dataPrismas);

    // Cria as URLs de download.
    const urlRespForm = URL.createObjectURL(blobDashboard);
    const urlPrismas = URL.createObjectURL(blobPrismas);

    // Realiza o download de um arquivo.
    const downloadFile = (url: string, filename: string) => {
      const link = document.createElement('a');

      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // Primeiro download: respostas.
    downloadFile(urlRespForm, 'respostas-formulario.csv');

    // Segundo download: resultados dos prismas.
    setTimeout(() => {
      downloadFile(urlPrismas, 'resultados-prismas.csv');

      // Libera as URLs após os downloads.
      setTimeout(() => {
        URL.revokeObjectURL(urlRespForm);
        URL.revokeObjectURL(urlPrismas);
      }, 1000);
    }, 500);
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

          <DropdownMenuItem onSelect={handleOnExport}>CSV</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
