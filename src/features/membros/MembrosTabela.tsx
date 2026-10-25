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
import type { Membro, StatusMembro, TagMembro } from '@/types/api';

const TAMANHO_PAGINA = 5;

const COLUNAS_OPCIONAIS = [
  'email',
  'acao',
  'status',
  'tag',
  'atualizadoEm',
] as const;

type ColunaOpcional = (typeof COLUNAS_OPCIONAIS)[number];
type ColunaOrdenavel = 'email' | 'atualizadoEm';
type Direcao = 'asc' | 'desc';

interface MembrosTabelaProps {
  itens: Membro[];
  onExcluir: (id: string) => Promise<void>;
}

function formatarData(iso: string, idioma: string) {
  return new Intl.DateTimeFormat(idioma, { dateStyle: 'short' }).format(
    new Date(iso),
  );
}

function badgeStatusClass(status: StatusMembro) {
  return status === 'ativo' ? 'bg-[#4E8F67]' : 'bg-[#C88C32]';
}

function badgeTagClass(tag: TagMembro) {
  if (tag === 'marketing') return 'bg-[#009E4F]';
  if (tag === 'vendas') return 'bg-[#008AC9]';
  return 'bg-[#8B1E8B]';
}

export function MembrosTabela({ itens, onExcluir }: MembrosTabelaProps) {
  const { t, i18n } = useTranslation(['comum', 'membros']);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [ordenacao, setOrdenacao] = useState<{
    coluna: ColunaOrdenavel;
    direcao: Direcao;
  } | null>(null);
  const [colunasVisiveis, setColunasVisiveis] = useState<Set<ColunaOpcional>>(
    () => new Set(COLUNAS_OPCIONAIS),
  );
  const [menuColunasAberto, setMenuColunasAberto] = useState(false);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [detalhe, setDetalhe] = useState<Membro | null>(null);
  const [alvoExclusao, setAlvoExclusao] = useState<Membro | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState(false);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = termo
      ? itens.filter((membro) => membro.email.toLowerCase().includes(termo))
      : [...itens];

    if (!ordenacao) return lista;

    return lista.sort((a, b) => {
      const cmp =
        ordenacao.coluna === 'atualizadoEm'
          ? Date.parse(a.atualizado_em) - Date.parse(b.atualizado_em)
          : a.email.localeCompare(b.email, i18n.resolvedLanguage, {
              sensitivity: 'base',
            });
      return ordenacao.direcao === 'asc' ? cmp : -cmp;
    });
  }, [busca, itens, ordenacao, i18n.resolvedLanguage]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / TAMANHO_PAGINA),
  );
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice(
    (paginaAtual - 1) * TAMANHO_PAGINA,
    paginaAtual * TAMANHO_PAGINA,
  );

  function alternarOrdenacao(coluna: ColunaOrdenavel) {
    setPagina(1);
    setOrdenacao((atual) => {
      if (atual?.coluna !== coluna) {
        return { coluna, direcao: 'asc' };
      }
      if (atual.direcao === 'asc') {
        return { coluna, direcao: 'desc' };
      }
      return null;
    });
  }

  function iconeOrdenacao(coluna: ColunaOrdenavel) {
    if (ordenacao?.coluna !== coluna) {
      return <ArrowUpDownIcon className="size-3.5 opacity-70" />;
    }
    return ordenacao.direcao === 'asc' ? (
      <ArrowUpIcon className="size-3.5" />
    ) : (
      <ArrowDownIcon className="size-3.5" />
    );
  }

  function visivel(coluna: ColunaOpcional) {
    return colunasVisiveis.has(coluna);
  }

  function alternarColuna(coluna: ColunaOpcional, marcada: boolean) {
    setColunasVisiveis((atual) => {
      const proximo = new Set(atual);
      if (marcada) {
        proximo.add(coluna);
      } else {
        proximo.delete(coluna);
      }
      return proximo;
    });
  }

  const idsPagina = visiveis.map((membro) => membro.id);
  const todosSelecionados =
    idsPagina.length > 0 && idsPagina.every((id) => selecionados.has(id));
  const algunsSelecionados =
    idsPagina.some((id) => selecionados.has(id)) && !todosSelecionados;

  function alternarTodos(marcado: boolean) {
    setSelecionados((atual) => {
      const proximo = new Set(atual);
      if (marcado) {
        idsPagina.forEach((id) => {
          proximo.add(id);
        });
      } else {
        idsPagina.forEach((id) => {
          proximo.delete(id);
        });
      }
      return proximo;
    });
  }

  function alternarLinha(id: string, marcado: boolean) {
    setSelecionados((atual) => {
      const proximo = new Set(atual);
      if (marcado) {
        proximo.add(id);
      } else {
        proximo.delete(id);
      }
      return proximo;
    });
  }

  async function confirmarExclusao() {
    if (!alvoExclusao || excluindo) return;
    setExcluindo(true);
    setErroExclusao(false);
    try {
      await onExcluir(alvoExclusao.id);
      setSelecionados((atual) => {
        const proximo = new Set(atual);
        proximo.delete(alvoExclusao.id);
        return proximo;
      });
      setAlvoExclusao(null);
    } catch {
      setErroExclusao(true);
    } finally {
      setExcluindo(false);
    }
  }

  const buscaAtiva = busca.trim().length > 0;
  const selecionadosNaPagina = visiveis.filter((membro) =>
    selecionados.has(membro.id),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          id="busca-email-membro"
          type="search"
          value={busca}
          onChange={(evento) => {
            setBusca(evento.target.value);
            setPagina(1);
          }}
          placeholder={t('membros:buscaEmail')}
          aria-label={t('membros:buscaEmail')}
          className="h-10 w-full max-w-xs rounded-lg border border-[#7C50B0] bg-card px-3 text-sm placeholder:text-[#8A8794] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
        />

        <Popover.Root
          open={menuColunasAberto}
          onOpenChange={setMenuColunasAberto}
        >
          <Popover.Trigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-lg border-zinc-200 bg-card px-3.5 text-sm font-medium hover:bg-zinc-50"
            >
              {t('membros:colunas')}
              <ChevronDownIcon className="ml-1 size-4" />
            </Button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={6}
              aria-label={t('membros:colunasMenu')}
              className="z-30 w-48 rounded-lg border border-border bg-card p-2 shadow-lg"
            >
              {COLUNAS_OPCIONAIS.map((coluna) => (
                <label
                  key={coluna}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-accent"
                >
                  <Checkbox
                    checked={visivel(coluna)}
                    onCheckedChange={(valor) => {
                      alternarColuna(coluna, valor === true);
                    }}
                  />
                  <span>{t(`membros:colunasNomes.${coluna}`)}</span>
                </label>
              ))}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      <div className="overflow-hidden rounded-lg">
        <Table aria-label={t('membros:tabela')}>
          <TableHeader>
            <TableRow className="border-b border-border/60 hover:bg-transparent">
              <TableHead className="w-10 pl-2">
                <Checkbox
                  checked={
                    algunsSelecionados ? 'indeterminate' : todosSelecionados
                  }
                  onCheckedChange={(valor) => {
                    alternarTodos(valor === true);
                  }}
                  aria-label={t('membros:selecionarPagina')}
                  disabled={visiveis.length === 0}
                />
              </TableHead>
              <TableHead className="font-heading text-sm font-bold text-heading">
                {t('membros:colunasNomes.nome')}
              </TableHead>
              {visivel('email') && (
                <TableHead
                  aria-sort={
                    ordenacao?.coluna === 'email'
                      ? ordenacao.direcao === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center gap-1 font-heading text-sm font-bold text-heading"
                    onClick={() => {
                      alternarOrdenacao('email');
                    }}
                    aria-label={t('membros:ordenarEmail')}
                  >
                    {t('membros:colunasNomes.email')}
                    {iconeOrdenacao('email')}
                  </button>
                </TableHead>
              )}
              {visivel('acao') && (
                <TableHead className="text-center font-heading text-sm font-bold text-heading">
                  {t('membros:colunasNomes.acao')}
                </TableHead>
              )}
              {visivel('status') && (
                <TableHead className="text-center font-heading text-sm font-bold text-heading">
                  {t('membros:colunasNomes.status')}
                </TableHead>
              )}
              {visivel('tag') && (
                <TableHead className="text-center font-heading text-sm font-bold text-heading">
                  {t('membros:colunasNomes.tag')}
                </TableHead>
              )}
              {visivel('atualizadoEm') && (
                <TableHead
                  className="text-center"
                  aria-sort={
                    ordenacao?.coluna === 'atualizadoEm'
                      ? ordenacao.direcao === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center justify-center gap-1 font-heading text-sm font-bold text-heading"
                    onClick={() => {
                      alternarOrdenacao('atualizadoEm');
                    }}
                    aria-label={t('membros:ordenarData')}
                  >
                    {t('membros:colunasNomes.atualizadoEm')}
                    {iconeOrdenacao('atualizadoEm')}
                  </button>
                </TableHead>
              )}
              <TableHead className="text-center font-heading text-sm font-semibold text-destructive">
                {t('membros:colunasNomes.excluir')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visiveis.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={3 + colunasVisiveis.size}
                  className="py-10 text-center text-muted-foreground"
                >
                  {buscaAtiva ? t('membros:vazioBusca') : t('membros:vazio')}
                </TableCell>
              </TableRow>
            )}
            {visiveis.map((membro) => {
              const marcada = selecionados.has(membro.id);
              const isAtivo = membro.status === 'ativo';

              return (
                <TableRow
                  key={membro.id}
                  data-state={marcada ? 'selected' : undefined}
                  className="border-b border-border/30 transition-colors hover:bg-muted/30"
                >
                  <TableCell className="pl-2">
                    <Checkbox
                      checked={marcada}
                      onCheckedChange={(valor) => {
                        alternarLinha(membro.id, valor === true);
                      }}
                      aria-label={membro.nome}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {membro.nome}
                  </TableCell>
                  {visivel('email') && (
                    <TableCell
                      title={membro.email}
                      className="max-w-[220px] truncate text-muted-foreground"
                    >
                      {membro.email}
                    </TableCell>
                  )}
                  {visivel('acao') && (
                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setDetalhe(membro);
                        }}
                        className={cn(
                          'inline-flex cursor-pointer items-center justify-center rounded-full px-4 py-1 text-xs font-semibold shadow-none transition-colors select-none',
                          isAtivo
                            ? 'bg-[#532B88] text-white hover:bg-[#6438A0]'
                            : 'bg-[#E2D8F3] text-[#7C50B0] hover:bg-[#D7C8EE]',
                        )}
                      >
                        {t('membros:ver')}
                      </button>
                    </TableCell>
                  )}
                  {visivel('status') && (
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          'inline-flex items-center justify-center rounded-full px-3.5 py-0.5 text-xs font-medium text-white shadow-none select-none',
                          badgeStatusClass(membro.status),
                        )}
                      >
                        {t(`membros:status.${membro.status}`)}
                      </span>
                    </TableCell>
                  )}
                  {visivel('tag') && (
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          'inline-flex items-center justify-center rounded-full px-3.5 py-0.5 text-xs font-medium text-white shadow-none select-none',
                          badgeTagClass(membro.tag),
                        )}
                      >
                        {t(`membros:tags.${membro.tag}`)}
                      </span>
                    </TableCell>
                  )}
                  {visivel('atualizadoEm') && (
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {formatarData(membro.atualizado_em, i18n.language)}
                    </TableCell>
                  )}
                  <TableCell className="text-center">
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-[#DC5548] transition-colors hover:bg-destructive/10 hover:text-[#B83E34]"
                      aria-label={`${t('membros:excluir')} ${membro.nome}`}
                      onClick={() => {
                        setErroExclusao(false);
                        setAlvoExclusao(membro);
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
          {t('membros:selecionados', {
            count: selecionadosNaPagina.length,
            total: visiveis.length,
          })}
        </p>
        <nav
          aria-label={t('membros:paginacao')}
          className="flex items-center gap-2"
        >
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {t('membros:pagina', { atual: paginaAtual, total: totalPaginas })}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={paginaAtual <= 1}
            onClick={() => {
              setPagina(Math.max(1, paginaAtual - 1));
            }}
            className="rounded-lg text-sm"
          >
            {t('membros:anterior')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={paginaAtual >= totalPaginas}
            onClick={() => {
              setPagina(paginaAtual + 1);
            }}
            className="rounded-lg text-sm"
          >
            {t('membros:proximo')}
          </Button>
        </nav>
      </div>

      <Dialog
        open={detalhe !== null}
        onOpenChange={(aberto) => {
          if (!aberto) {
            setDetalhe(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('membros:detalhesTitulo')}</DialogTitle>
            <DialogDescription>{detalhe?.nome}</DialogDescription>
          </DialogHeader>
          {detalhe && (
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">
                  {t('membros:colunasNomes.email')}
                </dt>
                <dd className="font-medium break-all">{detalhe.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {t('membros:colunasNomes.status')}
                </dt>
                <dd>
                  <span
                    className={cn(
                      'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white',
                      badgeStatusClass(detalhe.status),
                    )}
                  >
                    {t(`membros:status.${detalhe.status}`)}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {t('membros:colunasNomes.tag')}
                </dt>
                <dd>
                  <span
                    className={cn(
                      'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white',
                      badgeTagClass(detalhe.tag),
                    )}
                  >
                    {t(`membros:tags.${detalhe.tag}`)}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {t('membros:colunasNomes.atualizadoEm')}
                </dt>
                <dd className="font-medium">
                  {formatarData(detalhe.atualizado_em, i18n.language)}
                </dd>
              </div>
            </dl>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={alvoExclusao !== null}
        onOpenChange={(aberto) => {
          if (!aberto && !excluindo) {
            setAlvoExclusao(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('membros:confirmarExclusaoTitulo')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('membros:confirmarExclusaoDescricao', {
                nome: alvoExclusao?.nome ?? '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {erroExclusao && (
            <p role="alert" className="text-sm text-destructive">
              {t('membros:erroExclusao')}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>
              {t('acoes.cancelar')}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={excluindo}
              onClick={(evento) => {
                evento.preventDefault();
                void confirmarExclusao();
              }}
            >
              {excluindo ? t('membros:excluindo') : t('membros:excluir')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
