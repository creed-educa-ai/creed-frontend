import { useId, useRef, useState } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

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

// Compara sem diferenciar maiúsculas nem acentos: "jose" acha "José".
function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

// Cor cheia e texto branco nos dois status, como no mockup. Contraste abaixo do
// mínimo AA (4,5:1): ~3:1 no verde e ~4,2:1 no vermelho. Desvio a validar
// com o supervisor.
// > 🟡 Premissa — "Inativo" não aparece no mockup; assumimos vermelho cheio com
// > texto branco.
function StatusBadge({ status }: { status: MenteeStatus }) {
  const { t } = useTranslation(['mentees']);
  return (
    <span
      className={cn(
        'inline-block rounded-full px-3 py-1 text-xs font-medium text-primary-foreground',
        status === 'active' ? 'bg-success' : 'bg-destructive',
      )}
    >
      {t(`mentees:status.${status}`)}
    </span>
  );
}

export function MenteesTable({
  mentees,
  onViewResults,
  onEditQuestionnaire,
  onDelete,
}: MenteesTableProps) {
  const { t } = useTranslation(['mentees', 'comum']);
  const titleId = useId();
  const [query, setQuery] = useState('');
  const [menteeToDelete, setMenteeToDelete] = useState<Mentee | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<
    Record<ColumnKey, boolean>
  >({ questionnaire: true, results: true, status: true, delete: true });
  // Linhas marcadas na tabela. Por ora só marca e desmarca: nada sai do
  // componente e nenhuma ação usa a seleção.
  // > 🟡 Premissa — o mockup tem caixas de seleção para exportar resultados no
  // > futuro, mas a exportação não está especificada. A seleção fica só aqui,
  // > sem prop de saída, e os cartões (celular) não têm caixa.
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function toggleColumn(column: ColumnKey, checked: boolean) {
    setVisibleColumns((current) => ({ ...current, [column]: checked }));
  }

  const visible = mentees.filter((mentee) =>
    normalize(mentee.name).includes(normalize(query.trim())),
  );

  function toggleSelected(ids: string[], checked: boolean) {
    setSelectedIds((current) =>
      checked
        ? [...new Set([...current, ...ids])]
        : current.filter((id) => !ids.includes(id)),
    );
  }

  const allVisibleSelected =
    visible.length > 0 && visible.every((m) => selectedIds.includes(m.id));

  const cancelRef = useRef<HTMLButtonElement>(null);
  const [highlightCancel, setHighlightCancel] = useState(false);

  function closeDeleteDialog() {
    setHighlightCancel(false);
    setMenteeToDelete(null);
  }

  // Modal obrigatório (ver ui-e-responsividade.md): Esc e clique fora não
  // fecham. O foco vai para "Cancelar" e o botão ganha o anel de foco, mostrando
  // que é preciso escolher uma das opções.
  // > 🟡 Premissa — a convenção manda destacar "a ação principal". Aqui o
  // > destaque vai para Cancelar, a ação menos destrutiva: assim um Enter logo
  // > depois não exclui ninguém.
  function drawAttention() {
    cancelRef.current?.focus();
    setHighlightCancel(true);
  }

  async function confirmDelete() {
    if (!menteeToDelete || deleting) return;
    setDeleting(true);
    try {
      await onDelete(menteeToDelete);
      closeDeleteDialog();
    } catch {
      // O erro é de quem passou o `onDelete`. O diálogo continua aberto.
    } finally {
      setDeleting(false);
    }
  }

  // Os mesmos três botões aparecem na tabela e nos cartões do celular. No
  // celular têm 40px de altura (alvo de toque); da tabela em diante (md),
  // ficam compactos, como no mockup.
  function editButton(mentee: Mentee) {
    return (
      <Button
        type="button"
        className="h-10 rounded-full px-4 md:h-7 md:px-3 md:text-xs"
        disabled={!mentee.hasAnsweredCurrent}
        aria-label={t('mentees:actions.editFor', { name: mentee.name })}
        onClick={() => {
          onEditQuestionnaire(mentee);
        }}
      >
        {t('mentees:actions.edit')}
      </Button>
    );
  }

  function resultsButton(mentee: Mentee) {
    return (
      <Button
        type="button"
        className="h-10 rounded-full px-4 md:h-7 md:px-3 md:text-xs"
        disabled={!mentee.hasAnsweredCurrent}
        aria-label={t('mentees:actions.viewResultsFor', { name: mentee.name })}
        onClick={() => {
          onViewResults(mentee);
        }}
      >
        {t('mentees:actions.viewResults')}
      </Button>
    );
  }

  function deleteButton(mentee: Mentee) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-10 text-destructive hover:text-destructive md:size-7"
        aria-label={t('mentees:actions.deleteFor', { name: mentee.name })}
        onClick={() => {
          setMenteeToDelete(mentee);
        }}
      >
        <Trash2 />
      </Button>
    );
  }

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-4">
      <h2 id={titleId} className="text-xl font-bold text-heading">
        {t('mentees:title')}
      </h2>

      {mentees.length === 0 ? (
        <p
          role="status"
          className="rounded-lg border border-border px-4 py-8 text-center text-sm text-muted-foreground"
        >
          {t('mentees:empty')}
        </p>
      ) : (
        // No celular só há a busca acima dos cartões. Da tabela em diante (md),
        // busca, seleção de colunas e tabela ficam no mesmo container.
        <div className="flex flex-col gap-3 md:gap-0 md:overflow-hidden md:rounded-xl md:border md:border-border md:bg-card">
          <div className="flex items-center gap-3 md:p-4">
            <Input
              type="search"
              className="h-10 md:h-8 md:max-w-sm"
              aria-label={t('mentees:search.label')}
              placeholder={t('mentees:search.placeholder')}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="ml-auto hidden md:inline-flex"
                >
                  {t('mentees:columnsMenu')}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {TOGGLEABLE_COLUMNS.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column}
                    checked={visibleColumns[column]}
                    onCheckedChange={(checked) => {
                      toggleColumn(column, checked);
                    }}
                    onSelect={(event) => {
                      event.preventDefault();
                    }}
                  >
                    {t(`mentees:columns.${column}`)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {visible.length === 0 ? (
            <p
              role="status"
              className="rounded-lg border border-border px-4 py-8 text-center text-sm text-muted-foreground md:rounded-none md:border-x-0 md:border-b-0"
            >
              {t('mentees:noResults')}
            </p>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-card text-base text-heading">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-10 pl-5">
                        <Checkbox
                          aria-label={t('mentees:select.all')}
                          checked={allVisibleSelected}
                          onCheckedChange={(checked) => {
                            toggleSelected(
                              visible.map((m) => m.id),
                              checked === true,
                            );
                          }}
                        />
                      </TableHead>
                      <TableHead className="pr-5 pl-3 text-heading">
                        {t('mentees:columns.name')}
                      </TableHead>
                      {visibleColumns.questionnaire && (
                        <TableHead className="text-heading">
                          {t('mentees:columns.questionnaire')}
                        </TableHead>
                      )}
                      {visibleColumns.results && (
                        <TableHead className="text-heading">
                          {t('mentees:columns.results')}
                        </TableHead>
                      )}
                      {visibleColumns.status && (
                        <TableHead className="text-center text-heading">
                          {t('mentees:columns.status')}
                        </TableHead>
                      )}
                      {visibleColumns.delete && (
                        <TableHead className="text-center text-destructive">
                          {t('mentees:columns.delete')}
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visible.map((mentee) => (
                      <TableRow
                        key={mentee.id}
                        className="hover:bg-transparent"
                      >
                        <TableCell className="w-10 py-1.5 pl-5">
                          <Checkbox
                            aria-label={t('mentees:select.row', {
                              name: mentee.name,
                            })}
                            checked={selectedIds.includes(mentee.id)}
                            onCheckedChange={(checked) => {
                              toggleSelected([mentee.id], checked === true);
                            }}
                          />
                        </TableCell>
                        <TableCell className="py-1.5 pr-5 pl-3 font-medium break-words">
                          {mentee.name}
                        </TableCell>
                        {visibleColumns.questionnaire && (
                          <TableCell className="py-1.5">
                            {editButton(mentee)}
                          </TableCell>
                        )}
                        {visibleColumns.results && (
                          <TableCell className="py-1.5">
                            {resultsButton(mentee)}
                          </TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell className="py-1.5 text-center">
                            <StatusBadge status={mentee.status} />
                          </TableCell>
                        )}
                        {visibleColumns.delete && (
                          <TableCell className="py-1.5 text-center">
                            {deleteButton(mentee)}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <ul className="grid gap-3 md:hidden">
                {visible.map((mentee) => (
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
        </div>
      )}

      {/* Fecha só pelos botões (Cancelar ou Excluir). */}
      <AlertDialog open={menteeToDelete !== null}>
        <AlertDialogContent
          onOverlayClick={drawAttention}
          onEscapeKeyDown={(event) => {
            event.preventDefault();
            drawAttention();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('mentees:confirmDelete.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('mentees:confirmDelete.description', {
                name: menteeToDelete?.name ?? '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              ref={cancelRef}
              disabled={deleting}
              className={cn(
                highlightCancel && 'border-ring ring-3 ring-ring/50',
              )}
              onBlur={() => {
                setHighlightCancel(false);
              }}
              onClick={() => {
                closeDeleteDialog();
              }}
            >
              {t('comum:acoes.cancelar')}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive-solid"
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {t('mentees:confirmDelete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
