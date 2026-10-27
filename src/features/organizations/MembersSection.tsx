import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { SectionHeader } from '@/components/layout/sectionHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { MembersTable } from '@/features/organizations/MembersTable';
import {
  deleteMember,
  loadMembers,
} from '@/features/organizations/organizationsSlice';

// Seção "Membros de <organização>": carrega os membros e cobre os estados de
// carregando, erro e pronto. Usada pelo painel de controle e pelo MembersView.
export function MembersSection() {
  const { t } = useTranslation(['comum', 'organizations']);
  const dispatch = useAppDispatch();
  const { members, organization, status, error } = useAppSelector(
    (state) => state.organizations,
  );

  useEffect(() => {
    void dispatch(loadMembers());
  }, [dispatch]);

  async function handleDelete(id: string) {
    await dispatch(deleteMember(id)).unwrap();
  }

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader>
        {organization
          ? t('organizations:members.title', { organization })
          : t('organizations:members.table')}
      </SectionHeader>
      <div className="rounded-3xl bg-card p-6 shadow-sm">
        {status === 'loading' && (
          <div className="space-y-3" aria-live="polite">
            <p className="text-sm text-muted-foreground">{t('carregando')}</p>
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
    </section>
  );
}
