import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDeleteDialog } from '@/components/table/confirmDeleteDialog';
import { CenterCell } from '@/components/table/centerCell';
import { SortableHead } from '@/components/table/sortableHead';
import { TableFooter } from '@/components/table/tableFooter';
import {
  RowActionButton,
  DeleteRowButton,
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
import type { MemberListItem } from '@/types/api';
import { EmptyState } from '@/components/states/EmptyState';

// Cada linha é um vínculo `mentoria` (`MemberListItem`, da M-2). Sem coluna
// de status: o que importa é a pessoa estar cadastrada na CREED (CREED-69).
// > 🟡 Premissa P-064 — só "Ver Resultados" depende de a pessoa já ter
// > respondido (`period.has_answered`): sem resposta não há resultado.
// > "Editar" fica sempre habilitado, porque é por ele que a super adm cria o
// > questionário de quem ainda não tem. Confirmar na reunião.

interface MenteesTableProps {
  mentees: MemberListItem[];
  onViewResults: (mentee: MemberListItem) => void;
  onEditQuestionnaire: (mentee: MemberListItem) => void;
  // Pode devolver uma promessa: o diálogo espera por ela para fechar. Se for
  // rejeitada, o diálogo continua aberto para tentar de novo.
  onDelete: (mentee: MemberListItem) => void | Promise<void>;
  // O que o modal mostra quando `onDelete` é rejeitado. Sem ela, a mensagem
  // genérica de exclusão.
  deleteErrorMessage?: string | null;
  // Caixas de seleção na primeira coluna. Desligadas por padrão: nenhuma ação
  // usa a seleção ainda.
  // > 🟡 Premissa — o Figma tem as caixas (exportar resultados no futuro), mas
  // > nada está especificado. O código fica, e volta ligando esta prop.
  selectable?: boolean;
}

export function MenteesTable({
  mentees,
  onViewResults,
  onEditQuestionnaire,
  onDelete,
  deleteErrorMessage = null,
  selectable = false,
}: MenteesTableProps) {
  const { t, i18n } = useTranslation(['mentees', 'comum']);
  const [nameQuery, setNameQuery] = useState('');
  const [emailQuery, setEmailQuery] = useState('');
  const [menteeToDelete, setMenteeToDelete] = useState<MemberListItem | null>(
    null,
  );
  // Linhas marcadas na tabela. Por ora só marca e desmarca: nada sai do
  // componente e nenhuma ação usa a seleção.
  // > 🟡 Premissa — o mockup tem caixas de seleção para exportar resultados no
  // > futuro, mas a exportação não está especificada. A seleção fica só aqui,
  // > sem prop de saída, e os cartões (celular) não têm caixa.
  const selection = useRowSelection();

  const { sorting, toggle: toggleSort, directionOf } = useTableSort<'name'>();

  // As duas buscas valem juntas: a linha precisa bater com as duas. Vínculo
  // sem login não tem e-mail: conta como texto vazio.
  const visible = mentees.filter(
    (mentee) =>
      normalizeForSearch(mentee.name).includes(normalizeForSearch(nameQuery)) &&
      normalizeForSearch(mentee.email ?? '').includes(
        normalizeForSearch(emailQuery),
      ),
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

  const pageIds = pageMentees.map((mentee) => mentee.link_id);
  const selectedOnPage = pageIds.filter((id) => selection.isSelected(id));
  const allPageSelected =
    pageIds.length > 0 && selectedOnPage.length === pageIds.length;

  // Os mesmos três botões aparecem na tabela e nos cartões do celular. No
  // celular têm 40px de altura (alvo de toque); da tabela em diante (md),
  // ficam compactos, como no mockup.
  function editButton(mentee: MemberListItem) {
    return (
      <RowActionButton
        className="h-10 px-4 md:h-7 md:px-3"
        aria-label={t('mentees:actions.editFor', { name: mentee.name })}
        onClick={() => {
          onEditQuestionnaire(mentee);
        }}
      >
        {t('mentees:actions.edit')}
      </RowActionButton>
    );
  }

  function resultsButton(mentee: MemberListItem) {
    return (
      <RowActionButton
        className="h-10 px-4 md:h-7 md:px-3"
        disabled={mentee.period?.has_answered !== true}
        aria-label={t('mentees:actions.viewResultsFor', { name: mentee.name })}
        onClick={() => {
          onViewResults(mentee);
        }}
      >
        {t('mentees:actions.viewResults')}
      </RowActionButton>
    );
  }

  function deleteButton(mentee: MemberListItem) {
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
        <EmptyState>{t('mentees:empty')}</EmptyState>
      ) : (
        <>
          <TableToolbar
            searches={[
              {
                key: 'name',
                value: nameQuery,
                onChange: (value) => {
                  setNameQuery(value);
                  pagination.reset();
                },
                label: t('mentees:search.name.label'),
                placeholder: t('mentees:search.name.placeholder'),
              },
              {
                key: 'email',
                value: emailQuery,
                onChange: (value) => {
                  setEmailQuery(value);
                  pagination.reset();
                },
                label: t('mentees:search.email.label'),
                placeholder: t('mentees:search.email.placeholder'),
              },
            ]}
          />

          {visible.length === 0 ? (
            <EmptyState>{t('mentees:noResults')}</EmptyState>
          ) : (
            <>
              {/* No desktop cheio (2xl) o painel do admin põe esta tabela ao lado
                  da outra: as células apertam para as colunas caberem na metade. */}
              <div className="hidden overflow-x-auto md:block 2xl:[&_td]:px-2 2xl:[&_th]:px-2">
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
                      <TableHead className={tableHeadClass}>
                        {t('mentees:columns.email')}
                      </TableHead>
                      <TableHead className={cn(tableHeadClass, 'text-center')}>
                        {t('mentees:columns.questionnaire')}
                      </TableHead>
                      <TableHead className={cn(tableHeadClass, 'text-center')}>
                        {t('mentees:columns.results')}
                      </TableHead>
                      <TableHead className={tableHeadDangerClass}>
                        {t('mentees:columns.delete')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageMentees.map((mentee) => (
                      <TableRow key={mentee.link_id}>
                        {selectable && (
                          <TableCell>
                            <Checkbox
                              aria-label={t('mentees:select.row', {
                                name: mentee.name,
                              })}
                              checked={selection.isSelected(mentee.link_id)}
                              onCheckedChange={(checked) => {
                                selection.toggle(
                                  [mentee.link_id],
                                  checked === true,
                                );
                              }}
                            />
                          </TableCell>
                        )}
                        <TableCell className="font-medium break-words">
                          {mentee.name}
                        </TableCell>
                        <TableCell
                          title={mentee.email ?? undefined}
                          className="max-w-[220px] truncate text-muted-foreground 2xl:max-w-[160px]"
                        >
                          {mentee.email}
                        </TableCell>
                        <CenterCell>{editButton(mentee)}</CenterCell>
                        <CenterCell>{resultsButton(mentee)}</CenterCell>
                        <CenterCell>{deleteButton(mentee)}</CenterCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <ul className="grid gap-3 md:hidden">
                {pageMentees.map((mentee) => (
                  <li
                    key={mentee.link_id}
                    className="min-w-0 rounded-lg border border-border bg-card p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium break-words text-foreground">
                        {mentee.name}
                      </p>
                      <p className="text-sm break-all text-muted-foreground">
                        {mentee.email}
                      </p>
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
        errorMessage={deleteErrorMessage}
        onConfirm={async () => {
          if (!menteeToDelete) return;
          await onDelete(menteeToDelete);
          selection.remove(menteeToDelete.link_id);
        }}
        onClose={() => {
          setMenteeToDelete(null);
        }}
      />
    </div>
  );
}
