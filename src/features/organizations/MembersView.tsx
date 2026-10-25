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
import { MembersTable } from '@/features/organizations/MembersTable';
import {
  deleteMember,
  loadMembers,
} from '@/features/organizations/organizationsSlice';

export function MembersView() {
  const { t } = useTranslation(['comum', 'organizations']);
  const dispatch = useAppDispatch();
  const { members, organization, status, error } = useAppSelector(
    (state) => state.organizations,
  );
  const [open, setOpen] = useState(true);

  useEffect(() => {
    void dispatch(loadMembers());
  }, [dispatch]);

  async function handleDelete(id: string) {
    await dispatch(deleteMember(id)).unwrap();
  }

  return (
    <section className="min-h-svh bg-background p-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <div className="flex justify-end">
          <SeletorIdioma />
        </div>

        <Collapsible open={open} onOpenChange={setOpen} className="space-y-4">
          <div className="flex items-center gap-3">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="group flex cursor-pointer items-center gap-2 rounded-sm text-left transition-opacity outline-none hover:opacity-85 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ChevronDownIcon
                  className={cn(
                    'size-5 text-heading transition-transform duration-200',
                    !open && '-rotate-90',
                  )}
                />
                <h2 className="font-heading text-lg font-bold break-words text-heading">
                  {organization
                    ? t('organizations:members.title', { organization })
                    : t('organizations:members.table')}
                </h2>
              </button>
            </CollapsibleTrigger>
            <div className="h-[1.5px] flex-1 bg-primary/30" />
          </div>

          <CollapsibleContent>
            <div className="min-h-[calc(100svh-9rem)] rounded-[20px] border border-primary/15 bg-card p-3 shadow-sm sm:p-6">
              {status === 'loading' && (
                <div className="space-y-3" aria-live="polite">
                  <p className="text-sm text-muted-foreground">
                    {t('carregando')}
                  </p>
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-40 w-full" />
                </div>
              )}

              {status === 'error' && (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive"
                >
                  {error && t(error)} {t('tenteRecarregar')}
                </p>
              )}

              {status === 'ready' && (
                <MembersTable members={members} onDelete={handleDelete} />
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
}
