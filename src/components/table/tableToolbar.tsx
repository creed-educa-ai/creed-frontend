import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export interface ToolbarColumn {
  key: string;
  label: string;
  visible: boolean;
}

interface TableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchLabel: string;
  searchPlaceholder: string;
  // Colunas que a pessoa pode esconder. O nome fica sempre: sem ele não dá
  // para saber de quem é a linha.
  columns: ToolbarColumn[];
  onToggleColumn: (key: string, visible: boolean) => void;
}

// Busca à esquerda e menu "Colunas" à direita, no topo de toda tabela.
export function TableToolbar({
  search,
  onSearchChange,
  searchLabel,
  searchPlaceholder,
  columns,
  onToggleColumn,
}: TableToolbarProps) {
  const { t } = useTranslation(['comum']);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Input
        type="search"
        value={search}
        onChange={(event) => {
          onSearchChange(event.target.value);
        }}
        aria-label={searchLabel}
        placeholder={searchPlaceholder}
        className="h-10 w-full max-w-sm border-primary"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" className="h-10">
            {t('comum:tabela.colunas')}
            <ChevronDown aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.key}
              checked={column.visible}
              onCheckedChange={(checked) => {
                onToggleColumn(column.key, checked);
              }}
              // Mantém o menu aberto para esconder várias colunas seguidas.
              onSelect={(event) => {
                event.preventDefault();
              }}
            >
              {column.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
