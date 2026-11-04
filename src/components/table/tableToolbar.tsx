import { Search } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';

export interface TableSearch {
  key: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}

interface TableToolbarProps {
  // Um campo por busca, na ordem em que aparecem. No celular ficam um embaixo
  // do outro; do `sm` em diante, lado a lado, encolhendo juntos quando a
  // tabela é estreita.
  searches: TableSearch[];
}

// Busca no topo de toda tabela.
export function TableToolbar({ searches }: TableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {searches.map((search) => (
        <InputGroup
          key={search.key}
          className="sm:max-w-xs sm:min-w-0 sm:flex-1"
        >
          <InputGroupAddon>
            <Search aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={search.value}
            onChange={(event) => {
              search.onChange(event.target.value);
            }}
            aria-label={search.label}
            placeholder={search.placeholder}
          />
        </InputGroup>
      ))}
    </div>
  );
}
