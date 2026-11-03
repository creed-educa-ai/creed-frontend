import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ComparisonOption<T extends string> {
  id: T;
  label: string;
  // Desenho antes do nome, no menu e no botão (ex.: a cor do setor).
  icon?: ReactNode;
  // Aparece no menu, mas não dá para escolher (ex.: o período exibido sem
  // setor, que seria comparar o recorte com ele mesmo).
  disabled?: boolean;
}

// Genérico no id para o setor voltar como `DepartmentType`, e não string.
interface ComparisonFilterProps<T extends string> {
  // O que o botão mostra quando nada está marcado (ex.: "Período").
  placeholder: string;
  options: ComparisonOption<T>[];
  // Id marcado; `null` é nenhum.
  value: T | null;
  onChange: (id: T) => void;
  // "Sem comparação" limpa este botão e o outro também.
  onClear: () => void;
}

// Um dos dois botões de comparação da seção (período e setor). Cada um escolhe
// à parte: só período, só setor ou os dois juntos. Escolher de novo o item
// marcado não muda nada; só "Sem comparação" limpa.
export function ComparisonFilter<T extends string>({
  placeholder,
  options,
  value,
  onChange,
  onClear,
}: ComparisonFilterProps<T>) {
  const { t } = useTranslation(['dashboardPrisma']);
  const selected = options.find((option) => option.id === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <ChevronDown />
          {selected?.icon}
          {selected?.label ?? placeholder}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={value ?? ''}>
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.id}
              value={option.id}
              disabled={option.disabled ?? false}
              onSelect={() => {
                onChange(option.id);
              }}
            >
              {option.icon}
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onClear}>
          {t('dashboardPrisma:semComparacao')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
