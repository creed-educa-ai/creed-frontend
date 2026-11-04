import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { MembersTable } from '@/features/users/MembersTable';
import {
  deleteMember,
  loadMembers,
  updateMemberTag,
} from '@/features/users/usersSlice';

// Card "Membros": carrega os membros e cobre os estados de carregando, erro e
// pronto. O separador com o nome da empresa é do painel de controle.
export function MembersSection() {
  const { t } = useTranslation(['comum', 'organizations']);
  const dispatch = useAppDispatch();
  const { members, status, error } = useAppSelector((state) => state.users);

  useEffect(() => {
    void dispatch(loadMembers());
  }, [dispatch]);

  async function handleDelete(id: string) {
    await dispatch(deleteMember(id)).unwrap();
  }

  return (
    // O card é a seção: o título fica dentro dele, como nos cards do
    // dashboard e do painel do admin.
    <section className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-sm">
      <h3 className="text-xl font-bold text-heading">
        {t('organizations:members.title')}
      </h3>
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
        <MembersTable
          members={members}
          onDelete={handleDelete}
          onChangeTag={(id, tag) => {
            void dispatch(updateMemberTag({ id, tag }));
          }}
        />
      )}
    </section>
  );
}
