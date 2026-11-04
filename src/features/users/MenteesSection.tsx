import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { MenteesTable } from '@/features/users/MenteesTable';
import { deleteMentee, loadMentees } from '@/features/users/usersSlice';

// Seção "Mentorandos" do painel do super adm. Cobre os estados de carregando,
// erro e pronto.
export function MenteesSection() {
  const { t } = useTranslation(['comum', 'mentees']);
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector(
    (state) => state.users.mentees,
  );

  useEffect(() => {
    void dispatch(loadMentees());
  }, [dispatch]);

  return (
    // O card é a seção: o título fica dentro dele, como nos cards do
    // dashboard. O separador ("Membros") é do painel.
    <section className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-sm">
      <h3 className="text-xl font-bold text-heading">{t('mentees:title')}</h3>
      {status === 'loading' && (
        <div className="space-y-3" aria-live="polite">
          <p className="text-sm text-muted-foreground">{t('carregando')}</p>
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
        <MenteesTable
          mentees={items}
          onViewResults={(mentee) => {
            console.log('Ver resultados do mentorando:', mentee.id);
            // TODO: integração com o backend
          }}
          onEditQuestionnaire={(mentee) => {
            console.log('Editar questionário do mentorando:', mentee.id);
            // TODO: integração com o backend
          }}
          onDelete={async (mentee) => {
            await dispatch(deleteMentee(mentee.id)).unwrap();
          }}
        />
      )}
    </section>
  );
}
