import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CenterCell } from '@/components/table/centerCell';
import { ConfirmDeleteDialog } from '@/components/table/confirmDeleteDialog';
import { SortableHead } from '@/components/table/sortableHead';
import { TableFooter } from '@/components/table/tableFooter';
import { DeleteRowButton, StatusPill } from '@/components/table/tablePills';
import {
  tableHeadClass,
  tableHeadDangerClass,
} from '@/components/table/tableStyles';
import { TableToolbar } from '@/components/table/tableToolbar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRowSelection } from '@/hooks/useRowSelection';
import { useTablePage } from '@/hooks/useTablePage';
import { useTableSort } from '@/hooks/useTableSort';
import { normalizeForSearch } from '@/lib/utils';
import { MemberTagPicker } from '@/features/users/MemberTagPicker';
import type { DepartmentType, Member } from '@/types/api';

type SortableColumn = 'name' | 'status' | 'tag' | 'updatedAt';

// Ordem do status no crescente, a mesma da tabela de empresas do admin.
// > 🟡 Premissa — "Pendente" (convite ainda não aceito) antes de "Ativo", não
// > a ordem alfabética do rótulo, que muda com o idioma.
const STATUS_ORDER: Record<Member['status'], number> = {
  pendente: 0,
  ativo: 1,
};

interface MembersTableProps {
  members: Member[];
  onDelete: (id: string) => Promise<void>;
  onChangeTag: (id: string, tag: DepartmentType | null) => void;
  // Caixas de seleção na primeira coluna. Desligadas por padrão: nenhuma ação
  // usa a seleção ainda.
  // > 🟡 Premissa — o Figma tem as caixas (exportar resultados no futuro), mas
  // > nada está especificado. O código fica, e volta ligando esta prop.
  selectable?: boolean;
}

function formatDate(iso: string, language: string) {
  return new Intl.DateTimeFormat(language, { dateStyle: 'short' }).format(
    new Date(iso),
  );
}

export function MembersTable({
  members,
  onDelete,
  onChangeTag,
  selectable = false,
}: MembersTableProps) {
  const { t, i18n } = useTranslation(['comum', 'organizations']);
  const [nameSearch, setNameSearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');
  const {
    sorting,
    toggle: toggleSort,
    directionOf,
  } = useTableSort<SortableColumn>();
  const selection = useRowSelection();
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

  const filtered = useMemo(() => {
    const nameTerm = normalizeForSearch(nameSearch);
    const emailTerm = normalizeForSearch(emailSearch);
    // As duas buscas valem juntas: o membro precisa bater com as duas.
    const list = members.filter(
      (member) =>
        normalizeForSearch(member.name).includes(nameTerm) &&
        normalizeForSearch(member.email).includes(emailTerm),
    );

    if (!sorting) return list;

    const byText = (a: string, b: string) =>
      a.localeCompare(b, i18n.resolvedLanguage, { sensitivity: 'base' });

    return list.sort((a, b) => {
      // Tag em ordem alfabética do nome do setor, no idioma da tela. Quem
      // está sem tag fica no fim nos dois sentidos.
      if (sorting.column === 'tag') {
        if (a.tag === null || b.tag === null) {
          return Number(a.tag === null) - Number(b.tag === null);
        }
        const cmp = byText(
          t(`comum:setores.${a.tag}`),
          t(`comum:setores.${b.tag}`),
        );
        return sorting.direction === 'asc' ? cmp : -cmp;
      }
      const cmp =
        sorting.column === 'updatedAt'
          ? Date.parse(a.updated_at) - Date.parse(b.updated_at)
          : sorting.column === 'status'
            ? STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
            : byText(a.name, b.name);
      return sorting.direction === 'asc' ? cmp : -cmp;
    });
  }, [nameSearch, emailSearch, members, sorting, i18n.resolvedLanguage, t]);

  const pagination = useTablePage(filtered);
  const pageMembers = pagination.pageItems;

  const pageIds = pageMembers.map((member) => member.id);
  const selectedOnPage = pageIds.filter((id) => selection.isSelected(id));
  const allSelected =
    pageIds.length > 0 && selectedOnPage.length === pageIds.length;
  const someSelected = selectedOnPage.length > 0 && !allSelected;
  const searching = Boolean(nameSearch.trim() || emailSearch.trim());

  // O mesmo selo e a mesma lixeira aparecem na tabela e nos cartões do
  // celular. No celular a lixeira tem 40px (alvo de toque); da tabela em
  // diante (md), fica compacta, como no mockup.
  function statusPill(member: Member) {
    return (
      <StatusPill tone={member.status === 'ativo' ? 'success' : 'warning'}>
        {t(`organizations:members.status.${member.status}`)}
      </StatusPill>
    );
  }

  // No celular, 40px de altura para o toque, como os outros botões.
  function tagPicker(member: Member) {
    return (
      <MemberTagPicker
        className="min-h-10 md:min-h-0"
        name={member.name}
        tag={member.tag}
        onChange={(tag) => {
          onChangeTag(member.id, tag);
        }}
      />
    );
  }

  function deleteButton(member: Member) {
    return (
      <DeleteRowButton
        className="size-10 md:size-8"
        label={`${t('organizations:members.delete')} ${member.name}`}
        onClick={() => {
          setDeleteTarget(member);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <TableToolbar
        searches={[
          {
            key: 'name',
            value: nameSearch,
            onChange: (value) => {
              setNameSearch(value);
              pagination.reset();
            },
            label: t('organizations:members.search.name.label'),
            placeholder: t('organizations:members.search.name.placeholder'),
          },
          {
            key: 'email',
            value: emailSearch,
            onChange: (value) => {
              setEmailSearch(value);
              pagination.reset();
            },
            label: t('organizations:members.search.email.label'),
            placeholder: t('organizations:members.search.email.placeholder'),
          },
        ]}
      />

      {pageMembers.length === 0 ? (
        <p
          role="status"
          className="rounded-lg border border-border px-4 py-8 text-center text-sm text-muted-foreground"
        >
          {searching
            ? t('organizations:members.emptySearch')
            : t('organizations:members.empty')}
        </p>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <Table aria-label={t('organizations:members.table')}>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {selectable && (
                    <TableHead className="w-10">
                      <Checkbox
                        checked={someSelected ? 'indeterminate' : allSelected}
                        onCheckedChange={(value) => {
                          selection.toggle(pageIds, value === true);
                        }}
                        aria-label={t('organizations:members.selectPage')}
                      />
                    </TableHead>
                  )}
                  <SortableHead
                    label={t('organizations:members.columnNames.name')}
                    ariaLabel={t('comum:tabela.ordenarPorNome')}
                    direction={directionOf('name')}
                    onToggle={() => {
                      pagination.reset();
                      toggleSort('name');
                    }}
                  />
                  <TableHead className={tableHeadClass}>
                    {t('organizations:members.columnNames.email')}
                  </TableHead>
                  <SortableHead
                    className="text-center"
                    label={t('organizations:members.columnNames.status')}
                    ariaLabel={t('comum:tabela.ordenarPorStatus')}
                    direction={directionOf('status')}
                    onToggle={() => {
                      pagination.reset();
                      toggleSort('status');
                    }}
                  />
                  <SortableHead
                    className="text-center"
                    label={t('organizations:members.columnNames.tag')}
                    ariaLabel={t('organizations:members.sortByTag')}
                    direction={directionOf('tag')}
                    onToggle={() => {
                      pagination.reset();
                      toggleSort('tag');
                    }}
                  />
                  <SortableHead
                    className="text-center"
                    label={t('organizations:members.columnNames.updatedAt')}
                    ariaLabel={t('organizations:members.sortByDate')}
                    direction={directionOf('updatedAt')}
                    onToggle={() => {
                      pagination.reset();
                      toggleSort('updatedAt');
                    }}
                  />
                  <TableHead className={tableHeadDangerClass}>
                    {t('organizations:members.columnNames.delete')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageMembers.map((member) => {
                  const checked = selection.isSelected(member.id);

                  return (
                    <TableRow
                      key={member.id}
                      data-state={checked ? 'selected' : undefined}
                    >
                      {selectable && (
                        <TableCell>
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => {
                              selection.toggle([member.id], value === true);
                            }}
                            aria-label={member.name}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">
                        {member.name}
                      </TableCell>
                      <TableCell
                        title={member.email}
                        className="max-w-[220px] truncate text-muted-foreground"
                      >
                        {member.email}
                      </TableCell>
                      <CenterCell>{statusPill(member)}</CenterCell>
                      <CenterCell>{tagPicker(member)}</CenterCell>
                      <CenterCell className="text-sm text-muted-foreground">
                        {formatDate(member.updated_at, i18n.language)}
                      </CenterCell>
                      <CenterCell>{deleteButton(member)}</CenterCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Cartões no celular, sem caixa de seleção, como nos mentorandos. */}
          <ul className="grid gap-3 md:hidden">
            {pageMembers.map((member) => (
              <li
                key={member.id}
                className="min-w-0 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium break-words text-foreground">
                      {member.name}
                    </p>
                    <p className="text-sm break-all text-muted-foreground">
                      {member.email}
                    </p>
                  </div>
                  {statusPill(member)}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {tagPicker(member)}
                  <span>{formatDate(member.updated_at, i18n.language)}</span>
                  <span className="ml-auto">{deleteButton(member)}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <TableFooter
        selected={selectable ? selectedOnPage.length : undefined}
        total={pageMembers.length}
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPrevious={pagination.previous}
        onNext={pagination.next}
      />

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        title={t('organizations:members.confirmDeleteTitle')}
        description={t('organizations:members.confirmDeleteDescription', {
          name: deleteTarget?.name ?? '',
        })}
        errorMessage={t('organizations:members.deleteError')}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await onDelete(deleteTarget.id);
          selection.remove(deleteTarget.id);
        }}
        onClose={() => {
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
