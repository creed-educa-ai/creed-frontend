import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface TableFooterProps {
  // Linhas marcadas na página atual. Sem seleção na tabela, não passe: o
  // texto "X de Y selecionadas" some.
  selected?: number | undefined;
  // Total de linhas na página, para o "X de Y". Só faz sentido com `selected`.
  total?: number;
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  // Ação da tabela que depende da seleção (ex.: "Aprovar" das empresas).
  actions?: ReactNode;
}

// Rodapé de toda tabela: seleção à esquerda, paginação à direita.
export function TableFooter({
  selected,
  total,
  page,
  totalPages,
  onPrevious,
  onNext,
  actions,
}: TableFooterProps) {
  const { t } = useTranslation(['comum']);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {selected !== undefined && total !== undefined && (
        <p className="text-sm text-muted-foreground">
          {t('comum:tabela.selecionadas', { count: selected, total })}
        </p>
      )}

      <nav
        aria-label={t('comum:tabela.paginacao')}
        className="flex flex-wrap items-center gap-2 sm:ml-auto"
      >
        {actions}
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {t('comum:tabela.pagina', { current: page, total: totalPages })}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={onPrevious}
        >
          {t('comum:tabela.anterior')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={onNext}
        >
          {t('comum:tabela.proximo')}
        </Button>
      </nav>
    </div>
  );
}
