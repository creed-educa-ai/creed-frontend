import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { SeletorIdioma } from '@/components/SeletorIdioma';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { MembrosTabela } from '@/features/membros/MembrosTabela';
import {
  carregarMembros,
  excluirMembro,
} from '@/features/membros/membrosSlice';

export function MembrosView() {
  const { t } = useTranslation(['comum', 'membros']);
  const dispatch = useAppDispatch();
  const { itens, empresa, status, erro } = useAppSelector(
    (state) => state.membros,
  );
  const [aberto, setAberto] = useState(true);

  useEffect(() => {
    void dispatch(carregarMembros());
  }, [dispatch]);

  async function aoExcluir(id: string) {
    await dispatch(excluirMembro(id)).unwrap();
  }

  return (
    <section className="min-h-svh bg-background p-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <div className="flex justify-end">
          <SeletorIdioma />
        </div>

        <Collapsible
          open={aberto}
          onOpenChange={setAberto}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="group flex cursor-pointer items-center gap-2 rounded-sm text-left transition-opacity outline-none hover:opacity-85 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ChevronDownIcon
                  className={cn(
                    'size-5 text-heading transition-transform duration-200',
                    !aberto && '-rotate-90',
                  )}
                />
                <h2 className="font-heading text-lg font-bold break-words text-heading">
                  {empresa
                    ? t('membros:titulo', { empresa })
                    : t('membros:tabela')}
                </h2>
              </button>
            </CollapsibleTrigger>
            <div className="h-[1.5px] flex-1 bg-primary/30" />
          </div>

          <CollapsibleContent>
            <div className="min-h-[calc(100svh-9rem)] rounded-[20px] border border-primary/15 bg-card p-3 shadow-sm sm:p-6">
              {status === 'carregando' && (
                <div className="space-y-3" aria-live="polite">
                  <p className="text-sm text-muted-foreground">
                    {t('carregando')}
                  </p>
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-40 w-full" />
                </div>
              )}

              {status === 'erro' && (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive"
                >
                  {erro && t(`membros:${erro}`)} {t('tenteRecarregar')}
                </p>
              )}

              {status === 'pronto' && (
                <MembrosTabela itens={itens} onExcluir={aoExcluir} />
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
}
