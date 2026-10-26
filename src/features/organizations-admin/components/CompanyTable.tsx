import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, Trash2 } from 'lucide-react';

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
import {
  ModalAceite,
  type EmpresaPendente,
} from '@/components/modals/ModalAceite';

export type StatusEmpresa = 'ativo' | 'pendente';

export interface Empresa extends EmpresaPendente {
  id: string;
  status: StatusEmpresa;
}

interface CompanyTableProps {
  empresas: Empresa[];
  onVerResultados: (id: string) => void;
  onExcluir: (id: string) => void;
  onAceitar: (empresa: Empresa) => void;
  onRejeitar: (empresa: Empresa) => void;
}

const COLUNAS_OCULTAVEIS = [
  'nome',
  'email',
  'resultados',
  'status',
  'excluir',
] as const;

export function CompanyTable({
  empresas,
  onVerResultados,
  onExcluir,
  onAceitar,
  onRejeitar,
}: CompanyTableProps) {
  const { t } = useTranslation(['empresas']);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [empresaEmAnalise, setEmpresaEmAnalise] = useState<Empresa | null>(
    null,
  );

  const columns = useMemo<ColumnDef<Empresa>[]>(
    () => [
      {
        id: 'aprovar',
        header: () => (
          <span className="font-bold text-heading">
            {t('empresas:colunas.aprovar')}
          </span>
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(valor) => {
              row.toggleSelected(valor === true);
            }}
            aria-label={t('empresas:selecionarLinha', {
              nome: row.original.nomeEmpresa,
            })}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: 'nome',
        accessorKey: 'nomeEmpresa',
        header: () => (
          <span className="font-bold text-heading">
            {t('empresas:colunas.nome')}
          </span>
        ),
      },
      {
        id: 'email',
        accessorKey: 'email',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-0 font-bold text-heading"
            onClick={() => {
              column.toggleSorting(column.getIsSorted() === 'asc');
            }}
          >
            {t('empresas:colunas.email')}
            <ArrowUpDown className="size-4" aria-hidden="true" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="block max-w-48 truncate">{row.original.email}</span>
        ),
      },
      {
        id: 'resultados',
        header: () => (
          <div className="text-center font-bold text-heading">
            {t('empresas:colunas.resultados')}
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Button
              size="sm"
              className="rounded-full"
              disabled={row.original.status === 'pendente'}
              onClick={() => {
                onVerResultados(row.original.id);
              }}
            >
              {t('empresas:verResultados')}
            </Button>
          </div>
        ),
        enableSorting: false,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: () => (
          <div className="text-center font-bold text-heading">
            {t('empresas:colunas.status')}
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-semibold text-white ${
                row.original.status === 'ativo' ? 'bg-success' : 'bg-warning'
              }`}
            >
              {t(`empresas:status.${row.original.status}`)}
            </span>
          </div>
        ),
      },
      {
        id: 'excluir',
        header: () => (
          <div className="text-center font-bold text-destructive">
            {t('empresas:colunas.excluir')}
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              aria-label={t('empresas:excluirEmpresa', {
                nome: row.original.nomeEmpresa,
              })}
              onClick={() => {
                onExcluir(row.original.id);
              }}
            >
              <Trash2 className="size-5" aria-hidden="true" />
            </Button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [t, onVerResultados, onExcluir],
  );

  const table = useReactTable({
    data: empresas,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: (row) => row.original.status === 'pendente',
    getRowId: (empresa) => empresa.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  // Só conta o que a pesquisa deixa visível: uma linha selecionada e depois
  // escondida pelo filtro não pode abrir o modal de aprovação.
  const selecionadas = table.getFilteredSelectedRowModel().rows;

  return (
    <div className="w-full rounded-3xl bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          value={globalFilter}
          onChange={(evento) => {
            setGlobalFilter(evento.target.value);
          }}
          placeholder={t('empresas:pesquisar')}
          aria-label={t('empresas:pesquisar')}
          className="max-w-sm"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {t('empresas:colunas.titulo')}
              <ChevronDown className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {COLUNAS_OCULTAVEIS.map((id) => (
              <DropdownMenuCheckboxItem
                key={id}
                checked={table.getColumn(id)?.getIsVisible() ?? true}
                onCheckedChange={(visivel) => {
                  table.getColumn(id)?.toggleVisibility(visivel);
                }}
              >
                {t(`empresas:colunas.${id}`)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 w-full overflow-x-auto">
        <Table>
          <TableHeader className="bg-card">
            {table.getHeaderGroups().map((grupo) => (
              <TableRow key={grupo.id} className="bg-card hover:bg-card">
                {grupo.headers.map((cabecalho) => (
                  <TableHead key={cabecalho.id} className="bg-card">
                    {cabecalho.isPlaceholder
                      ? null
                      : flexRender(
                          cabecalho.column.columnDef.header,
                          cabecalho.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((linha) => (
                <TableRow
                  key={linha.id}
                  data-state={linha.getIsSelected() ? 'selected' : undefined}
                  className="bg-card"
                >
                  {linha.getVisibleCells().map((celula) => (
                    <TableCell key={celula.id}>
                      {flexRender(
                        celula.column.columnDef.cell,
                        celula.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="bg-card">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t('empresas:vazio')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t('empresas:selecionadas', {
            selecionadas: selecionadas.length,
            total: table.getFilteredRowModel().rows.length,
          })}
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            className="bg-success text-white hover:bg-success/90"
            disabled={selecionadas.length !== 1}
            onClick={() => {
              setEmpresaEmAnalise(selecionadas[0]?.original ?? null);
            }}
          >
            {t('empresas:aprovar')}
          </Button>

          <Button
            variant="outline"
            className="bg-white hover:bg-gray-100"
            disabled={!table.getCanPreviousPage()}
            onClick={() => {
              table.previousPage();
            }}
          >
            {t('empresas:anterior')}
          </Button>

          <Button
            variant="outline"
            className="bg-white hover:bg-gray-100"
            disabled={!table.getCanNextPage()}
            onClick={() => {
              table.nextPage();
            }}
          >
            {t('empresas:proxima')}
          </Button>
        </div>
      </div>

      <ModalAceite
        open={empresaEmAnalise !== null}
        onOpenChange={(aberto) => {
          if (!aberto) {
            setEmpresaEmAnalise(null);
          }
        }}
        empresa={empresaEmAnalise}
        onAccept={() => {
          if (empresaEmAnalise) {
            onAceitar(empresaEmAnalise);
          }

          table.resetRowSelection();
          setEmpresaEmAnalise(null);
        }}
        onReject={() => {
          if (empresaEmAnalise) {
            onRejeitar(empresaEmAnalise);
          }

          table.resetRowSelection();
          setEmpresaEmAnalise(null);
        }}
      />
    </div>
  );
}
