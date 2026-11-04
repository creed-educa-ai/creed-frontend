import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { ManageQuestionnaireDialog } from '@/features/forms/ManageQuestionnaireDialog';
import type { ManageQuestionnaireFormValues } from '@/features/forms/manageQuestionnaireSchema';
import { MenteesTable } from '@/features/users/MenteesTable';
import type { Mentee } from '@/types/api';
import { deleteMentee, loadMentees } from '@/features/users/usersSlice';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { cardTitleClassName } from '@/lib/typography';

// Seção "Mentorandos" do painel do super adm. Cobre os estados de carregando,
// erro e pronto.
export function MenteesSection() {
  const { t } = useTranslation(['comum', 'mentees', 'painelControle']);
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector(
    (state) => state.users.mentees,
  );

  // Mentorando cujo questionário está aberto no modal.
  const [editing, setEditing] = useState<Mentee | null>(null);

  useEffect(() => {
    void dispatch(loadMentees());
  }, [dispatch]);

  function handleSaveQuestionnaire(
    mentee: Mentee,
    values: ManageQuestionnaireFormValues,
  ) {
    console.log('Questionário do mentorando:', mentee.id, values);
    // TODO: integração — como no painel da empresa, o back não tem onde
    // guardar o período (`FormRead` só tem `status`). Integrado, o toast vem
    // depois do `await` do salvamento.
    setEditing(null);
    toast.success(t('painelControle:toasts.questionarioNoAr'), {
      description: t('mentees:toasts.questionnaireSaved', {
        name: mentee.name,
      }),
    });
  }

  return (
    // O card é a seção: o título fica dentro dele, como nos cards do
    // dashboard. O separador ("Membros") é do painel.
    <Card asChild>
      <section>
        <CardContent className="flex flex-col gap-4">
          <h3 className={cardTitleClassName}>{t('mentees:title')}</h3>
          {status === 'loading' && (
            <LoadingState>
              <Skeleton className="h-40 w-full" />
            </LoadingState>
          )}

          {status === 'error' && <ErrorState message={error && t(error)} />}

          {status === 'ready' && (
            <MenteesTable
              mentees={items}
              onViewResults={(mentee) => {
                console.log('Ver resultados do mentorando:', mentee.id);
                // TODO: integração com o backend
              }}
              onEditQuestionnaire={setEditing}
              onDelete={async (mentee) => {
                await dispatch(deleteMentee(mentee.id)).unwrap();
                toast.success(t('mentees:toasts.deleted'), {
                  description: t('mentees:toasts.deletedDescription', {
                    nome: mentee.name,
                  }),
                });
              }}
            />
          )}

          <ManageQuestionnaireDialog
            open={editing !== null}
            onClose={() => {
              setEditing(null);
            }}
            personName={editing?.name ?? ''}
            onSave={(values) => {
              if (editing) handleSaveQuestionnaire(editing, values);
            }}
          />
        </CardContent>
      </section>
    </Card>
  );
}
