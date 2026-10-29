import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDeleteDialog } from '@/components/table/confirmDeleteDialog';
import { CenterCell } from '@/components/table/centerCell';
import { SortableHead } from '@/components/table/sortableHead';
import { TableFooter } from '@/components/table/tableFooter';
import {
  RowActionButton,
  DeleteRowButton,
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
import { useRowSelection } from '@/hooks/useRowSelection';
import { useTablePage } from '@/hooks/useTablePage';
import { useTableSort } from '@/hooks/useTableSort';
import { cn, normalizeForSearch } from '@/lib/utils';

// > 🟡 Premissa — o Figma da tabela de mentorandos só mostra "Ativo".
// > "Inativo" segue o `RecordStatus` do backend (`active` e `inactive`).
export type MenteeStatus = 'active' | 'inactive';

export interface Mentee {
  id: string;
  name: string;
  status: MenteeStatus;
  // Já respondeu o questionário atual? Enquanto não, "Editar" e "Ver
  // Resultados" ficam desabilitados.
  // > 🟡 Premissa — a spec só pede isso para "Editar"; o Figma desabilita os
  // > dois botões nas mesmas linhas.
  hasAnsweredCurrent: boolean;
}

interface MenteesTableProps {
  mentees: Mentee[];
  onViewResults: (mentee: Mentee) => void;
  onEditQuestionnaire: (mentee: Mentee) => void;
  // Pode devolver uma promessa: o diálogo espera por ela para fechar. Se for
  // rejeitada, o diálogo continua aberto para tentar de novo.
  onDelete: (mentee: Mentee) => void | Promise<void>;
  // Caixas de seleção na primeira coluna. Desligadas por padrão: nenhuma ação
  // usa a seleção ainda.
  // > 🟡 Premissa — o Figma tem as caixas (exportar resultados no futuro), mas
  // > nada está especificado. O código fica, e volta ligando esta prop.
  selectable?: boolean;
}

type ColumnKey = 'questionnaire' | 'results' | 'status' | 'delete';

// Colunas que a pessoa pode esconder, na ordem da tabela. "Nome" fica sempre:
// sem ela não dá para saber de quem é a linha.
// > 🟡 Premissa — o mockup não diz quais colunas são opcionais. Assumimos
// > todas, menos o nome. A escolha não é guardada ao recarregar.
const TOGGLEABLE_COLUMNS: ColumnKey[] = [
  'questionnaire',
  'results',
  'status',
  'delete',
];

// Cor cheia e texto branco nos dois status, como no mockup. Contraste abaixo do
// mínimo AA (4,5:1): ~3:1 no verde e ~4,2:1 no vermelho. Desvio a validar
// com o supervisor.
// > 🟡 Premissa — "Inativo" não aparece no mockup; assumimos vermelho cheio com
// > texto branco.
function StatusBadge({ status }: { status: MenteeStatus }) {
  const { t } = useTranslation(['mentees']);
  return (
    <StatusPill tone={status === 'active' ? 'success' : 'destructive'}>
      {t(`mentees:status.${status}`)}
    </StatusPill>
  );
}

export function MenteesTable({
  mentees,
  onViewResults,
  onEditQuestionnaire,
  onDelete,
  selectable = false,
}: MenteesTableProps) {
  const { t, i18n } = useTranslation(['mentees', 'comum']);
  const [query, setQuery] = useState('');
  const [menteeToDelete, setMenteeToDelete] = useState<Mentee | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<
    Record<ColumnKey, boolean>
  >({ questionnaire: true, results: true, status: true, delete: true });
  // Linhas marcadas na tabela. Por ora só marca e desmarca: nada sai do
  // componente e nenhuma ação usa a seleção.
  // > 🟡 Premissa — o mockup tem caixas de seleção para exportar resultados no
  // > futuro, mas a exportação não está especificada. A seleção fica só aqui,
  // > sem prop de saída, e os cartões (celular) não têm caixa.
  const selection = useRowSelection();

  const { sorting, toggle: toggleSort, directionOf } = useTableSort<'name'>();

  const visible = mentees.filter((mentee) =>
    normalizeForSearch(mentee.name).includes(normalizeForSearch(query)),
  );
  if (sorting) {
    visible.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, i18n.resolvedLanguage, {
        sensitivity: 'base',
      });
      return sorting.direction === 'asc' ? cmp : -cmp;
    });
  }
  const pagination = useTablePage(visible);
  const pageMentees = pagination.pageItems;

  const pageIds = pageMentees.map((mentee) => mentee.id);
  const selectedOnPage = pageIds.filter((id) => selection.isSelected(id));
  const allPageSelected =
    pageIds.length > 0 && selectedOnPage.length === pageIds.length;

  // Os mesmos três botões aparecem na tabela e nos cartões do celular. No
  // celular têm 40px de altura (alvo de toque); da tabela em diante (md),
  // ficam compactos, como no mockup.
  function editButton(mentee: Mentee) {
    return (
      <RowActionButton
        className="h-10 px-4 md:h-7 md:px-3"
        disabled={!mentee.hasAnsweredCurrent}
        aria-label={t('mentees:actions.editFor', { name: mentee.name })}
        onClick={() => {
          onEditQuestionnaire(mentee);
        }}
      >
        {t('mentees:actions.edit')}
      </RowActionButton>
    );
  }

  function resultsButton(mentee: Mentee) {
    return (
      <RowActionButton
        className="h-10 px-4 md:h-7 md:px-3"
        disabled={!mentee.hasAnsweredCurrent}
        aria-label={t('mentees:actions.viewResultsFor', { name: mentee.name })}
        onClick={() => {
          onViewResults(mentee);
        }}
      >
        {t('mentees:actions.viewResults')}
      </RowActionButton>
    );
  }

  function deleteButton(mentee: Mentee) {
    return (
      <DeleteRowButton
        className="size-10 md:size-8"
        label={t('mentees:actions.deleteFor', { name: mentee.name })}
        onClick={() => {
          setMenteeToDelete(mentee);
        }}
      />
    );
  }

  return (
    // O título ("Mentorandos") e o card são de quem usa o componente.
    <div className="flex flex-col gap-4">
      {mentees.length === 0 ? (
        <p
          role="status"
          className="rounded-lg border border-border px-4 py-8 text-center text-sm text-muted-foreground"
        >
          {t('mentees:empty')}
        </p>
      ) : (
        <>
          <TableToolbar
            search={query}
            onSearchChange={(value) => {
              setQuery(value);
              pagination.reset();
            }}
            searchLabel={t('mentees:search.label')}
            searchPlaceholder={t('mentees:search.placeholder')}
            columns={TOGGLEABLE_COLUMNS.map((column) => ({
              key: column,
              label: t(`mentees:columns.${column}`),
              visible: visibleColumns[column],
            }))}
            onToggleColumn={(key, checked) => {
              setVisibleColumns((current) => ({ ...current, [key]: checked }));
            }}
          />

          {visible.length === 0 ? (
            <p
              role="status"
              className="rounded-lg border border-border px-4 py-8 text-center text-sm text-muted-foreground"
            >
              {t('mentees:noResults')}
            </p>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {selectable && (
                        <TableHead className="w-10">
                          <Checkbox
                            aria-label={t('mentees:select.all')}
                            checked={allPageSelected}
                            onCheckedChange={(checked) => {
                              selection.toggle(pageIds, checked === true);
                            }}
                          />
                        </TableHead>
                      )}
                      <SortableHead
                        label={t('mentees:columns.name')}
                        ariaLabel={t('comum:tabela.ordenarPorNome')}
                        direction={directionOf('name')}
                        onToggle={() => {
                          pagination.reset();
                          toggleSort('name');
                        }}
                      />
                      {visibleColumns.questionnaire && (
                        <TableHead
                          className={cn(tableHeadClass, 'text-center')}
                        >
                          {t('mentees:columns.questionnaire')}
                        </TableHead>
                      )}
                      {visibleColumns.results && (
                        <TableHead
                          className={cn(tableHeadClass, 'text-center')}
                        >
                          {t('mentees:columns.results')}
                        </TableHead>
                      )}
                      {visibleColumns.status && (
                        <TableHead
                          className={cn(tableHeadClass, 'text-center')}
                        >
                          {t('mentees:columns.status')}
                        </TableHead>
                      )}
                      {visibleColumns.delete && (
                        <TableHead className={tableHeadDangerClass}>
                          {t('mentees:columns.delete')}
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageMentees.map((mentee) => (
                      <TableRow key={mentee.id}>
                        {selectable && (
                          <TableCell>
                            <Checkbox
                              aria-label={t('mentees:select.row', {
                                name: mentee.name,
                              })}
                              checked={selection.isSelected(mentee.id)}
                              onCheckedChange={(checked) => {
                                selection.toggle([mentee.id], checked === true);
                              }}
                            />
                          </TableCell>
                        )}
                        <TableCell className="font-medium break-words">
                          {mentee.name}
                        </TableCell>
                        {visibleColumns.questionnaire && (
                          <CenterCell>{editButton(mentee)}</CenterCell>
                        )}
                        {visibleColumns.results && (
                          <CenterCell>{resultsButton(mentee)}</CenterCell>
                        )}
                        {visibleColumns.status && (
                          <CenterCell>
                            <StatusBadge status={mentee.status} />
                          </CenterCell>
                        )}
                        {visibleColumns.delete && (
                          <CenterCell>{deleteButton(mentee)}</CenterCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <ul className="grid gap-3 md:hidden">
                {pageMentees.map((mentee) => (
                  <li
                    key={mentee.id}
                    className="min-w-0 rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 flex-1 font-medium break-words text-foreground">
                        {mentee.name}
                      </p>
                      <StatusBadge status={mentee.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {editButton(mentee)}
                      {resultsButton(mentee)}
                      <span className="ml-auto">{deleteButton(mentee)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          <TableFooter
            selected={selectable ? selectedOnPage.length : undefined}
            total={pageMentees.length}
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPrevious={pagination.previous}
            onNext={pagination.next}
          />
        </>
      )}

      <ConfirmDeleteDialog
        open={menteeToDelete !== null}
        title={t('mentees:confirmDelete.title')}
        description={t('mentees:confirmDelete.description', {
          name: menteeToDelete?.name ?? '',
        })}
        onConfirm={async () => {
          if (!menteeToDelete) return;
          await onDelete(menteeToDelete);
          selection.remove(menteeToDelete.id);
        }}
        onClose={() => {
          setMenteeToDelete(null);
        }}
      />
    </div>
  );
}
