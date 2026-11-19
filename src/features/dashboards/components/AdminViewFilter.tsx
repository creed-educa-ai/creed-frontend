import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * O que a administradora vê: o retrato atual de todas as empresas ou de todos
 * os mentorandos, ou uma empresa, ou um mentorando.
 */
export type AdminView =
  | { kind: 'companies' }
  | { kind: 'company'; id: string }
  | { kind: 'mentees' }
  | { kind: 'mentee'; id: string };

interface AdminOption {
  id: string;
  label: string;
}

interface AdminViewFilterProps {
  // Só quem tem resultado: as listas saem do retrato atual.
  companies: AdminOption[];
  mentees: AdminOption[];
  value: AdminView;
  onChange: (view: AdminView) => void;
}

// O radio group só marca por texto: o tipo vai na frente do id.
function viewKey(view: AdminView) {
  return 'id' in view ? `${view.kind}:${view.id}` : view.kind;
}

// O seletor da administradora, antes dos filtros da empresa: uma lista só,
// como o filtro do topo, com as empresas e, abaixo do separador, os
// mentorandos. O geral de cada um abre a lista.
export function AdminViewFilter({
  companies,
  mentees,
  value,
  onChange,
}: AdminViewFilterProps) {
  const { t } = useTranslation(['dashboard']);

  const label =
    value.kind === 'companies'
      ? t('dashboard:todasEmpresas')
      : value.kind === 'mentees'
        ? t('dashboard:todosMentorandos')
        : ([...companies, ...mentees].find(({ id }) => id === value.id)
            ?.label ??
          // Aberta pelo painel, uma empresa ou um mentorando ainda sem
          // resultado não está no retrato: o botão diz só o que é.
          (value.kind === 'company'
            ? t('dashboard:Empresa')
            : t('dashboard:Mentorando')));

  const item = (view: AdminView, text: string) => (
    <DropdownMenuRadioItem
      key={viewKey(view)}
      value={viewKey(view)}
      onSelect={() => {
        onChange(view);
      }}
    >
      {text}
    </DropdownMenuRadioItem>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="default">
          <ChevronDown />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-80 overflow-y-auto">
        <DropdownMenuRadioGroup value={viewKey(value)}>
          {item({ kind: 'companies' }, t('dashboard:todasEmpresas'))}
          {companies.map(({ id, label: name }) =>
            item({ kind: 'company', id }, name),
          )}
          <DropdownMenuSeparator />
          {item({ kind: 'mentees' }, t('dashboard:todosMentorandos'))}
          {mentees.map(({ id, label: name }) =>
            item({ kind: 'mentee', id }, name),
          )}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
