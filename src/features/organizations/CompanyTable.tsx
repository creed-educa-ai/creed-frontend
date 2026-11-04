import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CompanyApprovalModal } from '@/components/modals/CompanyApprovalModal';
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
import type { Company } from '@/types/api';
import { EmptyState } from '@/components/states/EmptyState';

interface CompanyTableProps {
  empresas: Company[];
  onVerResultados: (id: string) => void;
  // Pode devolver uma promessa: o diálogo de confirmação espera por ela.
  onExcluir: (id: string) => void | Promise<void>;
  onAceitar: (empresa: Company) => void;
  onRejeitar: (empresa: Company) => void;
}

export function CompanyTable({
  empresas,
  onVerResultados,
  onExcluir,
  onAceitar,
  onRejeitar,
}: CompanyTableProps) {
  const { t, i18n } = useTranslation(['empresas', 'comum']);
  const [pesquisaNome, setPesquisaNome] = useState('');
  const [pesquisaEmail, setPesquisaEmail] = useState('');
  const {
    sorting,
    toggle: alternarOrdem,
    directionOf,
  } = useTableSort<'nome' | 'status'>();
  const [empresaEmAnalise, setEmpresaEmAnalise] = useState<Company | null>(
    null,
  );
  const [empresaAExcluir, setEmpresaAExcluir] = useState<Company | null>(null);

  const filtradas = useMemo(() => {
    const termoNome = normalizeForSearch(pesquisaNome);
    const termoEmail = normalizeForSearch(pesquisaEmail);
    // As duas buscas valem juntas: a empresa precisa bater com as duas.
    const lista = empresas.filter(
      (empresa) =>
        normalizeForSearch(empresa.nomeEmpresa).includes(termoNome) &&
        normalizeForSearch(empresa.email).includes(termoEmail),
    );

    // Pendentes no topo: são as que pedem uma ação. Dentro de cada grupo vale
    // a ordem por nome, se ligada; senão, a ordem que veio. Ordenar por status
    // é o que tira as pendentes do topo: no decrescente, as ativas vêm antes.
    // > 🟡 Premissa — a ordem dos status é "Pendente" antes de "Ativo" (o que
    // > pede ação primeiro), não a alfabética do rótulo.
    const grupo = (empresa: Company) => (empresa.status === 'pendente' ? 0 : 1);
    return lista.sort((a, b) => {
      if (sorting?.column === 'status') {
        const cmp = grupo(a) - grupo(b);
        return sorting.direction === 'asc' ? cmp : -cmp;
      }
      if (grupo(a) !== grupo(b)) return grupo(a) - grupo(b);
      if (!sorting) return 0;
      const cmp = a.nomeEmpresa.localeCompare(
        b.nomeEmpresa,
        i18n.resolvedLanguage,
        { sensitivity: 'base' },
      );
      return sorting.direction === 'asc' ? cmp : -cmp;
    });
  }, [pesquisaNome, pesquisaEmail, empresas, sorting, i18n.resolvedLanguage]);

  const paginacao = useTablePage(filtradas);
  const empresasDaPagina = paginacao.pageItems;

  // Os mesmos botões aparecem na tabela e nos cartões do celular. No celular
  // têm 40px de altura (alvo de toque); da tabela em diante (md), ficam
  // compactos, como no mockup.
  function botaoResultados(empresa: Company) {
    return (
      <RowActionButton
        className="h-10 px-4 md:h-7 md:px-3"
        disabled={empresa.status === 'pendente'}
        onClick={() => {
          onVerResultados(empresa.id);
        }}
      >
        {t('empresas:verResultados')}
      </RowActionButton>
    );
  }

  // Pendente é um botão, igual ao "Ver Resultados", que abre o aceite da
  // empresa. Depois de aceita, vira o selo "Ativo".
  function status(empresa: Company) {
    if (empresa.status === 'pendente') {
      return (
        <RowActionButton
          className="h-10 px-4 md:h-7 md:px-3"
          aria-label={t('empresas:analisarCadastro', {
            nome: empresa.nomeEmpresa,
          })}
          title={t('empresas:analisarCadastro', { nome: empresa.nomeEmpresa })}
          onClick={() => {
            setEmpresaEmAnalise(empresa);
          }}
        >
          {t('empresas:status.pendente')}
        </RowActionButton>
      );
    }
    return <StatusPill tone="success">{t('empresas:status.ativo')}</StatusPill>;
  }

  function botaoExcluir(empresa: Company) {
    return (
      <DeleteRowButton
        className="size-10 md:size-8"
        label={t('empresas:excluirEmpresa', { nome: empresa.nomeEmpresa })}
        onClick={() => {
          setEmpresaAExcluir(empresa);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <TableToolbar
        searches={[
          {
            key: 'nome',
            value: pesquisaNome,
            onChange: (valor) => {
              setPesquisaNome(valor);
              paginacao.reset();
            },
            label: t('empresas:pesquisarNome.label'),
            placeholder: t('empresas:pesquisarNome.placeholder'),
          },
          {
            key: 'email',
            value: pesquisaEmail,
            onChange: (valor) => {
              setPesquisaEmail(valor);
              paginacao.reset();
            },
            label: t('empresas:pesquisarEmail.label'),
            placeholder: t('empresas:pesquisarEmail.placeholder'),
          },
        ]}
      />

      {empresasDaPagina.length === 0 ? (
        <EmptyState>{t('empresas:vazio')}</EmptyState>
      ) : (
        <>
          {/* No desktop cheio (2xl) o painel do admin põe esta tabela ao lado
              da outra: as células apertam para as colunas caberem na metade. */}
          <div className="hidden overflow-x-auto md:block 2xl:[&_td]:px-2 2xl:[&_th]:px-2">
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
                  <TableHead className={tableHeadClass}>
                    {t('empresas:colunas.email')}
                  </TableHead>
                  <TableHead className={cn(tableHeadClass, 'text-center')}>
                    {t('empresas:colunas.resultados')}
                  </TableHead>
                  <SortableHead
                    className="text-center"
                    label={t('empresas:colunas.status')}
                    ariaLabel={t('comum:tabela.ordenarPorStatus')}
                    direction={directionOf('status')}
                    onToggle={() => {
                      paginacao.reset();
                      alternarOrdem('status');
                    }}
                  />
                  <TableHead className={tableHeadDangerClass}>
                    {t('empresas:colunas.excluir')}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {empresasDaPagina.map((empresa) => (
                  <TableRow key={empresa.id}>
                    <TableCell className="font-medium">
                      {empresa.nomeEmpresa}
                    </TableCell>
                    <TableCell
                      title={empresa.email}
                      className="max-w-[220px] truncate text-muted-foreground 2xl:max-w-[160px]"
                    >
                      {empresa.email}
                    </TableCell>
                    <CenterCell>{botaoResultados(empresa)}</CenterCell>
                    <CenterCell>{status(empresa)}</CenterCell>
                    <CenterCell>{botaoExcluir(empresa)}</CenterCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul className="grid gap-3 md:hidden">
            {empresasDaPagina.map((empresa) => (
              <li
                key={empresa.id}
                className="min-w-0 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium break-words text-foreground">
                      {empresa.nomeEmpresa}
                    </p>
                    <p className="text-sm break-all text-muted-foreground">
                      {empresa.email}
                    </p>
                  </div>
                  {status(empresa)}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {botaoResultados(empresa)}
                  <span className="ml-auto">{botaoExcluir(empresa)}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <TableFooter
        page={paginacao.page}
        totalPages={paginacao.totalPages}
        onPrevious={paginacao.previous}
        onNext={paginacao.next}
      />

      <CompanyApprovalModal
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
