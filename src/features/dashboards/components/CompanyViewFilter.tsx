import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DepartmentDot } from '@/components/department/DepartmentTag';
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
  // O resultado de quem está logado, se ela respondeu o período: a gestora vê
  // só o próprio, porque o resultado individual é anônimo para a empresa. Não é
  // um recorte da empresa: abre o dashboard individual dela (`onOpenOwnResult`).
  ownResult?: ViewOption<string> | undefined;
  onOpenOwnResult?: (() => void) | undefined;
  // As outras pessoas: só a administradora recebe (a da CREED, que acompanha
  // os mentorandos).
  members: ViewOption<string>[];
  value: DashboardView;
  // O nome do recorte escolhido, mostrado no botão.
  label: string;
  // A opção da organização inteira leva o nome dela.
  organizationName: string;
  onChange: (view: DashboardView) => void;
}

// O radio group só marca por texto: cada recorte vira uma chave com o tipo na
// frente, porque um setor e um membro podem ter o mesmo id.
function viewKey(view: DashboardView) {
  if (view.department) return `setor:${view.department}`;
  if (view.member_id) return `membro:${view.member_id}`;
  return 'geral';
}

// Uma lista só, como a da comparação: o próprio resultado à parte, acima; a
// empresa toda e os setores juntos. As outras pessoas ficam num submenu, que
// só a administradora vê.
export function CompanyViewFilter({
  departments,
  ownResult,
  onOpenOwnResult,
  members,
  value,
  label,
  organizationName,
  onChange,
}: CompanyViewFilterProps) {
  const { t } = useTranslation(['dashboard']);
  const selected = viewKey(value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="default">
          <ChevronDown />
          {value.department && (
            // Contorno claro: a cor do setor sobre o roxo do botão.
            <DepartmentDot
              department={value.department}
              className="ring-2 ring-primary-foreground"
            />
          )}
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-80 overflow-y-auto">
        <DropdownMenuRadioGroup value={selected}>
          {/* O próprio resultado fica à parte, acima: não é um recorte da
              empresa, abre o dashboard individual. */}
          {ownResult && (
            <>
              <DropdownMenuRadioItem
                value={viewKey({ member_id: ownResult.id })}
                onSelect={() => {
                  onOpenOwnResult?.();
                }}
              >
                {ownResult.label}
              </DropdownMenuRadioItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* A empresa toda e os setores juntos, como na comparação. Os
              setores somem se a organização não tem nenhum com resposta. */}
          <DropdownMenuRadioItem
            value={viewKey({})}
            onSelect={() => {
              onChange({});
            }}
          >
            {organizationName}
          </DropdownMenuRadioItem>
          {departments.map((department) => (
            <DropdownMenuRadioItem
              key={department.id}
              value={viewKey({ department: department.id })}
              onSelect={() => {
                onChange({ department: department.id });
              }}
            >
              <DepartmentDot department={department.id} />
              {department.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        {members.length > 0 && (
          <>
            <DropdownMenuSeparator />
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
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
