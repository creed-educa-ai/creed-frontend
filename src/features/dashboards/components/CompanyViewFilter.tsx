import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ViewOption {
  id: string;
  label: string;
}

interface CompanyViewFilterProps {
  groups: ViewOption[];
  members: ViewOption[];
  // Id do grupo ou do membro selecionado: os dois dividem a mesma seleção.
  value: string;
  onChange: (id: string) => void;
}

export function CompanyViewFilter({
  groups,
  members,
  value,
  onChange,
}: CompanyViewFilterProps) {
  const { t } = useTranslation(['dashboard']);

  const selectedLabel =
    [...groups, ...members].find((option) => option.id === value)?.label ?? '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="default" className="gap-2">
          <ChevronDown />
          {selectedLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* GRUPOS */}
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {groups.map((group) => (
            <DropdownMenuRadioItem key={group.id} value={group.id}>
              {group.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        {/* SELETOR DE FUNCIONÁRIO */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {t('dashboard:Funcionario')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-64 overflow-y-auto">
            <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
              {members.map((member) => (
                <DropdownMenuRadioItem
                  key={member.id}
                  value={member.id}
                  onSelect={() => {
                    onChange(member.id);
                  }}
                >
                  {member.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
