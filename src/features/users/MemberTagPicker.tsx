import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DepartmentDot,
  DepartmentTag,
} from '@/components/department/DepartmentTag';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DEPARTMENTS } from '@/lib/departmentColors';
import { cn } from '@/lib/utils';
import type { DepartmentType } from '@/types/api';

// O radio group só marca por texto: "sem tag" vira uma chave própria.
const NONE = 'none';

interface MemberTagPickerProps {
  name: string;
  tag: DepartmentType | null;
  onChange: (tag: DepartmentType | null) => void;
  className?: string;
}

// A tag do membro é o próprio botão: o clique abre os setores para escolher.
// Sem tag, mostra "Sem tag" no mesmo formato, com borda tracejada.
// > 🟡 Premissa — "Sem tag" também é uma opção do menu, para desfazer uma
// > escolha errada. O pedido só falava em escolher entre os cinco setores.
export function MemberTagPicker({
  name,
  tag,
  onChange,
  className,
}: MemberTagPickerProps) {
  const { t } = useTranslation(['comum', 'organizations']);
  const visible = tag
    ? t(`comum:setores.${tag}`)
    : t('organizations:members.tags.none');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('organizations:members.tags.change', {
            tag: visible,
            name,
          })}
          className={cn(
            'inline-flex cursor-pointer items-center gap-1 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
            className,
          )}
        >
          {tag ? (
            <DepartmentTag department={tag} />
          ) : (
            <span className="inline-flex items-center rounded-full border border-dashed border-muted-foreground px-3 py-0.5 text-xs font-medium whitespace-nowrap text-muted-foreground hover:bg-accent">
              {visible}
            </span>
          )}
          <ChevronDown
            aria-hidden="true"
            className="size-3.5 text-muted-foreground"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={tag ?? NONE}
          onValueChange={(value) => {
            onChange(value === NONE ? null : (value as DepartmentType));
          }}
        >
          {DEPARTMENTS.map((department) => (
            <DropdownMenuRadioItem key={department} value={department}>
              <DepartmentDot department={department} />
              {t(`comum:setores.${department}`)}
            </DropdownMenuRadioItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuRadioItem value={NONE}>
            {t('organizations:members.tags.none')}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
