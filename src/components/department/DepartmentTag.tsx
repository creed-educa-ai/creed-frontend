import { useTranslation } from 'react-i18next';
import { StatusPill } from '@/components/table/tablePills';
import { DEPARTMENT_COLORS } from '@/lib/departmentColors';
import { cn } from '@/lib/utils';
import type { DepartmentType } from '@/types/api';

// O setor como tag: o mesmo selo e a mesma cor em toda tela que mostra setor
// (tabela de membros, mapa do dashboard).
export function DepartmentTag({ department }: { department: DepartmentType }) {
  const { t } = useTranslation(['comum']);

  return (
    <StatusPill className={DEPARTMENT_COLORS[department]}>
      {t(`comum:setores.${department}`)}
    </StatusPill>
  );
}

// Só a cor do setor, para menus e botões, onde a tag inteira pesaria. O nome
// vem ao lado, como texto: a bolinha é decorativa.
export function DepartmentDot({
  department,
  className,
}: {
  department: DepartmentType;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block size-2.5 shrink-0 rounded-full',
        DEPARTMENT_COLORS[department],
        className,
      )}
    />
  );
}
