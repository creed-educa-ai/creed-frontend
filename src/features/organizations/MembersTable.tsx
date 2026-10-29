import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CenterCell } from '@/components/table/centerCell';
import { ConfirmDeleteDialog } from '@/components/table/confirmDeleteDialog';
import { SortableHead } from '@/components/table/sortableHead';
import { TableFooter } from '@/components/table/tableFooter';
import {
  DeleteRowButton,
  RowActionButton,
  StatusPill,
} from '@/components/table/tablePills';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRowSelection } from '@/hooks/useRowSelection';
import { useTablePage } from '@/hooks/useTablePage';
import { useTableSort } from '@/hooks/useTableSort';
import { cn, normalizeForSearch } from '@/lib/utils';
import type { Member, MemberTag } from '@/types/api';

const OPTIONAL_COLUMNS = [
  'email',
  'action',
  'status',
  'tag',
  'updatedAt',
] as const;

type OptionalColumn = (typeof OPTIONAL_COLUMNS)[number];
type SortableColumn = 'name' | 'updatedAt';

interface MembersTableProps {
  members: Member[];
  onDelete: (id: string) => Promise<void>;
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

function tagBadgeClass(tag: MemberTag) {
  if (tag === 'marketing') return 'bg-[#009E4F]';
  if (tag === 'vendas') return 'bg-[#008AC9]';
  return 'bg-[#8B1E8B]';
}

export function MembersTable({
  members,
  onDelete,
  selectable = false,
}: MembersTableProps) {
  const { t, i18n } = useTranslation(['comum', 'organizations']);
  const [search, setSearch] = useState('');
  const {
    sorting,
    toggle: toggleSort,
    directionOf,
  } = useTableSort<SortableColumn>();
  const [visibleColumns, setVisibleColumns] = useState<Set<OptionalColumn>>(
    () => new Set(OPTIONAL_COLUMNS),
  );
  const selection = useRowSelection();
  const [details, setDetails] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

  const filtered = useMemo(() => {
    const term = normalizeForSearch(search);
    const list = term
      ? members.filter((member) =>
          normalizeForSearch(member.email).includes(term),
        )
      : [...members];

    if (!sorting) return list;

    return list.sort((a, b) => {
      const cmp =
        sorting.column === 'updatedAt'
          ? Date.parse(a.updated_at) - Date.parse(b.updated_at)
          : a.name.localeCompare(b.name, i18n.resolvedLanguage, {
              sensitivity: 'base',
            });
      return sorting.direction === 'asc' ? cmp : -cmp;
    });
  }, [search, members, sorting, i18n.resolvedLanguage]);

  const pagination = useTablePage(filtered);
  const pageMembers = pagination.pageItems;

  function isVisible(column: OptionalColumn) {
    return visibleColumns.has(column);
  }

  function toggleColumn(column: OptionalColumn, checked: boolean) {
    setVisibleColumns((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(column);
      } else {
        next.delete(column);
      }
      return next;
    });
  }

  const pageIds = pageMembers.map((member) => member.id);
  const selectedOnPage = pageIds.filter((id) => selection.isSelected(id));
  const allSelected =
    pageIds.length > 0 && selectedOnPage.length === pageIds.length;
  const someSelected = selectedOnPage.length > 0 && !allSelected;

  return (
    <div className="flex flex-col gap-4">
      <TableToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          pagination.reset();
        }}
        searchLabel={t('organizations:members.searchEmail')}
        searchPlaceholder={t('organizations:members.searchEmail')}
        columns={OPTIONAL_COLUMNS.map((column) => ({
          key: column,
          label: t(`organizations:members.columnNames.${column}`),
          visible: isVisible(column),
        }))}
        onToggleColumn={(key, visible) => {
          toggleColumn(key as OptionalColumn, visible);
        }}
      />

      <div className="overflow-x-auto">
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
                    disabled={pageMembers.length === 0}
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
              {isVisible('email') && (
                <TableHead className={tableHeadClass}>
                  {t('organizations:members.columnNames.email')}
                </TableHead>
              )}
              {isVisible('action') && (
                <TableHead className={cn(tableHeadClass, 'text-center')}>
                  {t('organizations:members.columnNames.action')}
                </TableHead>
              )}
              {isVisible('status') && (
                <TableHead className={cn(tableHeadClass, 'text-center')}>
                  {t('organizations:members.columnNames.status')}
                </TableHead>
              )}
              {isVisible('tag') && (
                <TableHead className={cn(tableHeadClass, 'text-center')}>
                  {t('organizations:members.columnNames.tag')}
                </TableHead>
              )}
              {isVisible('updatedAt') && (
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
              )}
              <TableHead className={tableHeadDangerClass}>
                {t('organizations:members.columnNames.delete')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageMembers.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={(selectable ? 3 : 2) + visibleColumns.size}
                  className="py-10 text-center text-muted-foreground"
                >
                  {search.trim()
                    ? t('organizations:members.emptySearch')
                    : t('organizations:members.empty')}
                </TableCell>
              </TableRow>
            )}
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
                  <TableCell className="font-medium">{member.name}</TableCell>
                  {isVisible('email') && (
                    <TableCell
                      title={member.email}
                      className="max-w-[220px] truncate text-muted-foreground"
                    >
                      {member.email}
                    </TableCell>
                  )}
                  {isVisible('action') && (
                    <CenterCell>
                      <RowActionButton
                        muted={member.status !== 'ativo'}
                        onClick={() => {
                          setDetails(member);
                        }}
                      >
                        {t('organizations:members.view')}
                      </RowActionButton>
                    </CenterCell>
                  )}
                  {isVisible('status') && (
                    <CenterCell>
                      <StatusPill
                        tone={member.status === 'ativo' ? 'success' : 'warning'}
                      >
                        {t(`organizations:members.status.${member.status}`)}
                      </StatusPill>
                    </CenterCell>
                  )}
                  {isVisible('tag') && (
                    <CenterCell>
                      <StatusPill className={tagBadgeClass(member.tag)}>
                        {t(`organizations:members.tags.${member.tag}`)}
                      </StatusPill>
                    </CenterCell>
                  )}
                  {isVisible('updatedAt') && (
                    <CenterCell className="text-sm text-muted-foreground">
                      {formatDate(member.updated_at, i18n.language)}
                    </CenterCell>
                  )}
                  <CenterCell>
                    <DeleteRowButton
                      label={`${t('organizations:members.delete')} ${member.name}`}
                      onClick={() => {
                        setDeleteTarget(member);
                      }}
                    />
                  </CenterCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <TableFooter
        selected={selectable ? selectedOnPage.length : undefined}
        total={pageMembers.length}
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPrevious={pagination.previous}
        onNext={pagination.next}
      />

      <Dialog
        open={details !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDetails(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('organizations:members.detailsTitle')}</DialogTitle>
            <DialogDescription>{details?.name}</DialogDescription>
          </DialogHeader>
          {details && (
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">
                  {t('organizations:members.columnNames.email')}
                </dt>
                <dd className="font-medium break-all">{details.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {t('organizations:members.columnNames.status')}
                </dt>
                <dd>
                  <StatusPill
                    tone={details.status === 'ativo' ? 'success' : 'warning'}
                  >
                    {t(`organizations:members.status.${details.status}`)}
                  </StatusPill>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {t('organizations:members.columnNames.tag')}
                </dt>
                <dd>
                  <StatusPill className={tagBadgeClass(details.tag)}>
                    {t(`organizations:members.tags.${details.tag}`)}
                  </StatusPill>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {t('organizations:members.columnNames.updatedAt')}
                </dt>
                <dd className="font-medium">
                  {formatDate(details.updated_at, i18n.language)}
                </dd>
              </div>
            </dl>
          )}
        </DialogContent>
      </Dialog>

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
