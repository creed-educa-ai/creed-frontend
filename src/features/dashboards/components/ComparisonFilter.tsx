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
}

// Genérico no id para o setor voltar como `DepartmentType`, e não string.
interface ComparisonFilterProps<T extends string> {
  // O que o botão mostra quando nada está marcado (ex.: "Período").
  placeholder: string;
  options: ComparisonOption<T>[];
  // Id marcado; `null` é nenhum.
  value: T | null;
  onChange: (id: T | null) => void;
  // "Sem comparação" limpa este botão e o outro também.
  onClear: () => void;
}

// Um dos dois botões de comparação da seção (período e setor). Clicar no item
// marcado desmarca: assim dá para comparar só por período, só por setor, ou
// pelos dois juntos.
export function ComparisonFilter<T extends string>({
  placeholder,
  options,
  value,
  onChange,
  onClear,
}: ComparisonFilterProps<T>) {
  const { t } = useTranslation(['dashboardPrisma']);
  const selectedLabel = options.find((option) => option.id === value)?.label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <ChevronDown />
          {selectedLabel ?? placeholder}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Sem `onValueChange`: o radio group só avisa quando o valor muda, e
            o clique no item já marcado precisa desmarcar. */}
        <DropdownMenuRadioGroup value={value ?? ''}>
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.id}
              value={option.id}
              onSelect={() => {
                onChange(option.id === value ? null : option.id);
              }}
            >
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
