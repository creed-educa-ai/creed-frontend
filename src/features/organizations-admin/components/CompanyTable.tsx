import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ModalAceite,
  type EmpresaPendente,
} from '@/components/modals/ModalAceite';
import { ConfirmDeleteDialog } from '@/components/table/confirmDeleteDialog';
import { SortableHead } from '@/components/table/sortableHead';
import { CenterCell } from '@/components/table/centerCell';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTablePage } from '@/hooks/useTablePage';
import { useTableSort } from '@/hooks/useTableSort';
import { cn, normalizeForSearch } from '@/lib/utils';

export type StatusEmpresa = 'ativo' | 'pendente';

export interface Empresa extends EmpresaPendente {
  id: string;
  status: StatusEmpresa;
}

interface CompanyTableProps {
  empresas: Empresa[];
  onVerResultados: (id: string) => void;
  // Pode devolver uma promessa: o diálogo de confirmação espera por ela.
  onExcluir: (id: string) => void | Promise<void>;
  onAceitar: (empresa: Empresa) => void;
  onRejeitar: (empresa: Empresa) => void;
}

// O nome fica sempre: sem ele não dá para saber de quem é a linha.
const COLUNAS_OCULTAVEIS = [
  'email',
  'resultados',
  'status',
  'excluir',
] as const;

type ColunaOcultavel = (typeof COLUNAS_OCULTAVEIS)[number];

export function CompanyTable({
  empresas,
  onVerResultados,
  onExcluir,
  onAceitar,
  onRejeitar,
}: CompanyTableProps) {
  const { t, i18n } = useTranslation(['empresas', 'comum']);
  const [pesquisa, setPesquisa] = useState('');
  const {
    sorting,
    toggle: alternarOrdem,
    directionOf,
  } = useTableSort<'nome'>();
  const [colunasVisiveis, setColunasVisiveis] = useState<Set<ColunaOcultavel>>(
    () => new Set(COLUNAS_OCULTAVEIS),
  );
  const [empresaEmAnalise, setEmpresaEmAnalise] = useState<Empresa | null>(
    null,
  );
  const [empresaAExcluir, setEmpresaAExcluir] = useState<Empresa | null>(null);

  const filtradas = useMemo(() => {
    const termo = normalizeForSearch(pesquisa);
    const lista = termo
      ? empresas.filter(
          (empresa) =>
            normalizeForSearch(empresa.nomeEmpresa).includes(termo) ||
            normalizeForSearch(empresa.email).includes(termo),
        )
      : [...empresas];

    // Pendentes sempre no topo: são as que pedem uma ação. Dentro de cada
    // grupo vale a ordem por nome, se ligada; senão, a ordem que veio.
    const grupo = (empresa: Empresa) => (empresa.status === 'pendente' ? 0 : 1);
    return lista.sort((a, b) => {
      if (grupo(a) !== grupo(b)) return grupo(a) - grupo(b);
      if (!sorting) return 0;
      const cmp = a.nomeEmpresa.localeCompare(
        b.nomeEmpresa,
        i18n.resolvedLanguage,
        { sensitivity: 'base' },
      );
      return sorting.direction === 'asc' ? cmp : -cmp;
    });
  }, [pesquisa, empresas, sorting, i18n.resolvedLanguage]);

  const paginacao = useTablePage(filtradas);
  const empresasDaPagina = paginacao.pageItems;

  function visivel(coluna: ColunaOcultavel) {
    return colunasVisiveis.has(coluna);
  }

  return (
    <div className="flex flex-col gap-4">
      <TableToolbar
        search={pesquisa}
        onSearchChange={(valor) => {
          setPesquisa(valor);
          paginacao.reset();
        }}
        searchLabel={t('empresas:pesquisar')}
        searchPlaceholder={t('empresas:pesquisar')}
        columns={COLUNAS_OCULTAVEIS.map((coluna) => ({
          key: coluna,
          label: t(`empresas:colunas.${coluna}`),
          visible: visivel(coluna),
        }))}
        onToggleColumn={(chave, mostrar) => {
          setColunasVisiveis((atuais) => {
            const proximas = new Set(atuais);
            if (mostrar) {
              proximas.add(chave as ColunaOcultavel);
            } else {
              proximas.delete(chave as ColunaOcultavel);
            }
            return proximas;
          });
        }}
      />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortableHead
                label={t('empresas:colunas.nome')}
                ariaLabel={t('comum:tabela.ordenarPorNome')}
                direction={directionOf('nome')}
                onToggle={() => {
                  paginacao.reset();
                  alternarOrdem('nome');
                }}
              />
              {visivel('email') && (
                <TableHead className={tableHeadClass}>
                  {t('empresas:colunas.email')}
                </TableHead>
              )}
              {visivel('resultados') && (
                <TableHead className={cn(tableHeadClass, 'text-center')}>
                  {t('empresas:colunas.resultados')}
                </TableHead>
              )}
              {visivel('status') && (
                <TableHead className={cn(tableHeadClass, 'text-center')}>
                  {t('empresas:colunas.status')}
                </TableHead>
              )}
              {visivel('excluir') && (
                <TableHead className={tableHeadDangerClass}>
                  {t('empresas:colunas.excluir')}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {empresasDaPagina.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={1 + colunasVisiveis.size}
                  className="py-10 text-center text-muted-foreground"
                >
                  {t('empresas:vazio')}
                </TableCell>
              </TableRow>
            )}
            {empresasDaPagina.map((empresa) => {
              const pendente = empresa.status === 'pendente';

              return (
                <TableRow key={empresa.id}>
                  <TableCell className="font-medium">
                    {empresa.nomeEmpresa}
                  </TableCell>
                  {visivel('email') && (
                    <TableCell
                      title={empresa.email}
                      className="max-w-[220px] truncate text-muted-foreground"
                    >
                      {empresa.email}
                    </TableCell>
                  )}
                  {visivel('resultados') && (
                    <CenterCell>
                      <RowActionButton
                        disabled={pendente}
                        onClick={() => {
                          onVerResultados(empresa.id);
                        }}
                      >
                        {t('empresas:verResultados')}
                      </RowActionButton>
                    </CenterCell>
                  )}
                  {visivel('status') && (
                    <CenterCell>
                      {/* Clicar no "Pendente" abre o aceite da empresa. */}
                      <StatusPill
                        tone={pendente ? 'warning' : 'success'}
                        {...(pendente && {
                          onClick: () => {
                            setEmpresaEmAnalise(empresa);
                          },
                          label: t('empresas:analisarCadastro', {
                            nome: empresa.nomeEmpresa,
                          }),
                        })}
                      >
                        {t(`empresas:status.${empresa.status}`)}
                      </StatusPill>
                    </CenterCell>
                  )}
                  {visivel('excluir') && (
                    <CenterCell>
                      <DeleteRowButton
                        label={t('empresas:excluirEmpresa', {
                          nome: empresa.nomeEmpresa,
                        })}
                        onClick={() => {
                          setEmpresaAExcluir(empresa);
                        }}
                      />
                    </CenterCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <TableFooter
        page={paginacao.page}
        totalPages={paginacao.totalPages}
        onPrevious={paginacao.previous}
        onNext={paginacao.next}
      />

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
          setEmpresaEmAnalise(null);
        }}
        onReject={() => {
          if (empresaEmAnalise) {
            onRejeitar(empresaEmAnalise);
          }
          setEmpresaEmAnalise(null);
        }}
      />

      <ConfirmDeleteDialog
        open={empresaAExcluir !== null}
        title={t('empresas:confirmarExclusao.titulo')}
        description={t('empresas:confirmarExclusao.descricao', {
          nome: empresaAExcluir?.nomeEmpresa ?? '',
        })}
        onConfirm={async () => {
          if (!empresaAExcluir) return;
          await onExcluir(empresaAExcluir.id);
        }}
        onClose={() => {
          setEmpresaAExcluir(null);
        }}
      />
    </div>
  );
}
