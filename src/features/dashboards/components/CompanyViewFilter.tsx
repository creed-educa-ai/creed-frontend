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
import type { DashboardFilters } from '@/features/dashboards/dashboardsApi';
import type { DepartmentType } from '@/types/api';

/** O recorte do topo: vazio é a organização inteira. */
export type DashboardView = Omit<DashboardFilters, 'period'>;

interface ViewOption<T extends string> {
  id: T;
  label: string;
}

interface CompanyViewFilterProps {
  departments: ViewOption<DepartmentType>[];
  members: ViewOption<string>[];
  value: DashboardView;
  // O nome do recorte escolhido, mostrado no botão.
  label: string;
  onChange: (view: DashboardView) => void;
}

// O radio group só marca por texto: cada recorte vira uma chave com o tipo na
// frente, porque um setor e um membro podem ter o mesmo id.
function viewKey(view: DashboardView) {
  if (view.department) return `setor:${view.department}`;
  if (view.member_id) return `membro:${view.member_id}`;
  return 'geral';
}

export function CompanyViewFilter({
  departments,
  members,
  value,
  label,
  onChange,
}: CompanyViewFilterProps) {
  const { t } = useTranslation(['dashboard']);
  const selected = viewKey(value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="default" className="gap-2">
          <ChevronDown />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={selected}>
          <DropdownMenuRadioItem
            value={viewKey({})}
            onSelect={() => {
              onChange({});
            }}
          >
            {t('dashboard:Geral')}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        {/* SELETOR DE SETOR */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {t('dashboard:Setor')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-64 overflow-y-auto">
            <DropdownMenuRadioGroup value={selected}>
              {departments.map((department) => (
                <DropdownMenuRadioItem
                  key={department.id}
                  value={viewKey({ department: department.id })}
                  onSelect={() => {
                    onChange({ department: department.id });
                  }}
                >
                  {department.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* SELETOR DE FUNCIONÁRIO */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {t('dashboard:Funcionario')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-64 overflow-y-auto">
            <DropdownMenuRadioGroup value={selected}>
              {members.map((member) => (
                <DropdownMenuRadioItem
                  key={member.id}
                  value={viewKey({ member_id: member.id })}
                  onSelect={() => {
                    onChange({ member_id: member.id });
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
