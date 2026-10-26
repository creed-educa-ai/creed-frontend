import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Popover } from 'radix-ui';
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  Trash2Icon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Member, MemberStatus, MemberTag } from '@/types/api';

const PAGE_SIZE = 5;

const OPTIONAL_COLUMNS = [
  'email',
  'action',
  'status',
  'tag',
  'updatedAt',
] as const;

type OptionalColumn = (typeof OPTIONAL_COLUMNS)[number];
type SortableColumn = 'email' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

interface MembersTableProps {
  members: Member[];
  onDelete: (id: string) => Promise<void>;
}

function formatDate(iso: string, language: string) {
  return new Intl.DateTimeFormat(language, { dateStyle: 'short' }).format(
    new Date(iso),
  );
}

function statusBadgeClass(status: MemberStatus) {
  return status === 'ativo' ? 'bg-[#4E8F67]' : 'bg-[#C88C32]';
}

function tagBadgeClass(tag: MemberTag) {
  if (tag === 'marketing') return 'bg-[#009E4F]';
  if (tag === 'vendas') return 'bg-[#008AC9]';
  return 'bg-[#8B1E8B]';
}

export function MembersTable({ members, onDelete }: MembersTableProps) {
  const { t, i18n } = useTranslation(['comum', 'organizations']);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<{
    column: SortableColumn;
    direction: SortDirection;
  } | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<OptionalColumn>>(
    () => new Set(OPTIONAL_COLUMNS),
  );
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [details, setDetails] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = term
      ? members.filter((member) => member.email.toLowerCase().includes(term))
      : [...members];

    if (!sorting) return list;

    return list.sort((a, b) => {
      const cmp =
        sorting.column === 'updatedAt'
          ? Date.parse(a.updated_at) - Date.parse(b.updated_at)
          : a.email.localeCompare(b.email, i18n.resolvedLanguage, {
              sensitivity: 'base',
            });
      return sorting.direction === 'asc' ? cmp : -cmp;
    });
  }, [search, members, sorting, i18n.resolvedLanguage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageMembers = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function toggleSorting(column: SortableColumn) {
    setPage(1);
    setSorting((current) => {
      if (current?.column !== column) {
        return { column, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { column, direction: 'desc' };
      }
      return null;
    });
  }

  function sortIcon(column: SortableColumn) {
    if (sorting?.column !== column) {
      return <ArrowUpDownIcon className="size-3.5 opacity-70" />;
    }
    return sorting.direction === 'asc' ? (
      <ArrowUpIcon className="size-3.5" />
    ) : (
      <ArrowDownIcon className="size-3.5" />
    );
  }

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
  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someSelected = pageIds.some((id) => selected.has(id)) && !allSelected;

  function toggleAll(checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) {
        pageIds.forEach((id) => {
          next.add(id);
        });
      } else {
        pageIds.forEach((id) => {
          next.delete(id);
        });
      }
      return next;
    });
  }

  function toggleRow(id: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError(false);
    try {
      await onDelete(deleteTarget.id);
      setSelected((current) => {
        const next = new Set(current);
        next.delete(deleteTarget.id);
        return next;
      });
      setDeleteTarget(null);
    } catch {
      setDeleteError(true);
    } finally {
      setDeleting(false);
    }
  }

  const searchActive = search.trim().length > 0;
  const selectedOnPage = pageMembers.filter((member) =>
    selected.has(member.id),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          id="member-email-search"
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder={t('organizations:members.searchEmail')}
          aria-label={t('organizations:members.searchEmail')}
          className="h-10 w-full max-w-xs rounded-lg border border-[#7C50B0] bg-card px-3 text-sm placeholder:text-[#8A8794] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
        />

        <Popover.Root open={columnsMenuOpen} onOpenChange={setColumnsMenuOpen}>
          <Popover.Trigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-lg border-zinc-200 bg-card px-3.5 text-sm font-medium hover:bg-zinc-50"
            >
              {t('organizations:members.columns')}
              <ChevronDownIcon className="ml-1 size-4" />
            </Button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={6}
              aria-label={t('organizations:members.columnsMenu')}
              className="z-30 w-48 rounded-lg border border-border bg-card p-2 shadow-lg"
            >
              {OPTIONAL_COLUMNS.map((column) => (
                <label
                  key={column}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-accent"
                >
                  <Checkbox
                    checked={isVisible(column)}
                    onCheckedChange={(value) => {
                      toggleColumn(column, value === true);
                    }}
                  />
                  <span>
                    {t(`organizations:members.columnNames.${column}`)}
                  </span>
                </label>
              ))}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      <div className="overflow-hidden rounded-lg">
        <Table aria-label={t('organizations:members.table')}>
          <TableHeader>
            <TableRow className="border-b border-border/60 hover:bg-transparent">
              <TableHead className="w-10 pl-2">
                <Checkbox
                  checked={someSelected ? 'indeterminate' : allSelected}
                  onCheckedChange={(value) => {
                    toggleAll(value === true);
                  }}
                  aria-label={t('organizations:members.selectPage')}
                  disabled={pageMembers.length === 0}
                />
              </TableHead>
              <TableHead className="font-heading text-sm font-bold text-heading">
                {t('organizations:members.columnNames.name')}
              </TableHead>
              {isVisible('email') && (
                <TableHead
                  aria-sort={
                    sorting?.column === 'email'
                      ? sorting.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center gap-1 font-heading text-sm font-bold text-heading"
                    onClick={() => {
                      toggleSorting('email');
                    }}
                    aria-label={t('organizations:members.sortByEmail')}
                  >
                    {t('organizations:members.columnNames.email')}
                    {sortIcon('email')}
                  </button>
                </TableHead>
              )}
              {isVisible('action') && (
                <TableHead className="text-center font-heading text-sm font-bold text-heading">
                  {t('organizations:members.columnNames.action')}
                </TableHead>
              )}
              {isVisible('status') && (
                <TableHead className="text-center font-heading text-sm font-bold text-heading">
                  {t('organizations:members.columnNames.status')}
                </TableHead>
              )}
              {isVisible('tag') && (
                <TableHead className="text-center font-heading text-sm font-bold text-heading">
                  {t('organizations:members.columnNames.tag')}
                </TableHead>
              )}
              {isVisible('updatedAt') && (
                <TableHead
                  className="text-center"
                  aria-sort={
                    sorting?.column === 'updatedAt'
                      ? sorting.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center justify-center gap-1 font-heading text-sm font-bold text-heading"
                    onClick={() => {
                      toggleSorting('updatedAt');
                    }}
                    aria-label={t('organizations:members.sortByDate')}
                  >
                    {t('organizations:members.columnNames.updatedAt')}
                    {sortIcon('updatedAt')}
                  </button>
                </TableHead>
              )}
              <TableHead className="text-center font-heading text-sm font-semibold text-destructive">
                {t('organizations:members.columnNames.delete')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageMembers.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={3 + visibleColumns.size}
                  className="py-10 text-center text-muted-foreground"
                >
                  {searchActive
                    ? t('organizations:members.emptySearch')
                    : t('organizations:members.empty')}
                </TableCell>
              </TableRow>
            )}
            {pageMembers.map((member) => {
              const checked = selected.has(member.id);
              const isActive = member.status === 'ativo';

              return (
                <TableRow
                  key={member.id}
                  data-state={checked ? 'selected' : undefined}
                  className="border-b border-border/30 transition-colors hover:bg-muted/30"
                >
                  <TableCell className="pl-2">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => {
                        toggleRow(member.id, value === true);
                      }}
                      aria-label={member.name}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {member.name}
                  </TableCell>
                  {isVisible('email') && (
                    <TableCell
                      title={member.email}
                      className="max-w-[220px] truncate text-muted-foreground"
                    >
                      {member.email}
                    </TableCell>
                  )}
                  {isVisible('action') && (
                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setDetails(member);
                        }}
                        className={cn(
                          'inline-flex cursor-pointer items-center justify-center rounded-full px-4 py-1 text-xs font-semibold shadow-none transition-colors select-none',
                          isActive
                            ? 'bg-[#532B88] text-white hover:bg-[#6438A0]'
                            : 'bg-[#E2D8F3] text-[#7C50B0] hover:bg-[#D7C8EE]',
                        )}
                      >
                        {t('organizations:members.view')}
                      </button>
                    </TableCell>
                  )}
                  {isVisible('status') && (
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          'inline-flex items-center justify-center rounded-full px-3.5 py-0.5 text-xs font-medium text-white shadow-none select-none',
                          statusBadgeClass(member.status),
                        )}
                      >
                        {t(`organizations:members.status.${member.status}`)}
                      </span>
                    </TableCell>
                  )}
                  {isVisible('tag') && (
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          'inline-flex items-center justify-center rounded-full px-3.5 py-0.5 text-xs font-medium text-white shadow-none select-none',
                          tagBadgeClass(member.tag),
                        )}
                      >
                        {t(`organizations:members.tags.${member.tag}`)}
                      </span>
                    </TableCell>
                  )}
                  {isVisible('updatedAt') && (
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {formatDate(member.updated_at, i18n.language)}
                    </TableCell>
                  )}
                  <TableCell className="text-center">
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-[#DC5548] transition-colors hover:bg-destructive/10 hover:text-[#B83E34]"
                      aria-label={`${t('organizations:members.delete')} ${member.name}`}
                      onClick={() => {
                        setDeleteError(false);
                        setDeleteTarget(member);
                      }}
                    >
                      <Trash2Icon className="size-4" />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {t('organizations:members.selected', {
            count: selectedOnPage.length,
            total: pageMembers.length,
          })}
        </p>
        <nav
          aria-label={t('organizations:members.pagination')}
          className="flex items-center gap-2"
        >
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {t('organizations:members.page', {
              current: currentPage,
              total: totalPages,
            })}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => {
              setPage(Math.max(1, currentPage - 1));
            }}
            className="rounded-lg text-sm"
          >
            {t('organizations:members.previous')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => {
              setPage(currentPage + 1);
            }}
            className="rounded-lg text-sm"
          >
            {t('organizations:members.next')}
          </Button>
        </nav>
      </div>

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
                  <span
                    className={cn(
                      'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white',
                      statusBadgeClass(details.status),
                    )}
                  >
                    {t(`organizations:members.status.${details.status}`)}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {t('organizations:members.columnNames.tag')}
                </dt>
                <dd>
                  <span
                    className={cn(
                      'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white',
                      tagBadgeClass(details.tag),
                    )}
                  >
                    {t(`organizations:members.tags.${details.tag}`)}
                  </span>
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

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('organizations:members.confirmDeleteTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('organizations:members.confirmDeleteDescription', {
                name: deleteTarget?.name ?? '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p role="alert" className="text-sm text-destructive">
              {t('organizations:members.deleteError')}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {t('acoes.cancelar')}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {deleting
                ? t('organizations:members.deleting')
                : t('organizations:members.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
