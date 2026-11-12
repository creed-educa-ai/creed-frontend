import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { ManageQuestionnaireDialog } from '@/features/forms/ManageQuestionnaireDialog';
import type { ManageQuestionnaireFormValues } from '@/features/forms/manageQuestionnaireSchema';
import { usePeriod } from '@/features/forms/usePeriod';
import { MenteesTable } from '@/features/users/MenteesTable';
import type { MemberListItem } from '@/types/api';
import {
  deleteMentee,
  loadMentees,
  type DeleteMenteeError,
} from '@/features/users/usersSlice';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { cardTitleClassName } from '@/lib/typography';

// Seção "Mentorandos" do painel do super adm. Cobre os estados de carregando,
// erro e pronto. Os mentorandos são os da organização da sessão, que para a
// administradora é a da CREED (P-048).
export function MenteesSection() {
  const { t } = useTranslation(['comum', 'mentees', 'painelControle']);
  const dispatch = useAppDispatch();
  const organizationId = useAppSelector(
    (state) => state.authentication.user?.organization_id ?? null,
  );
  const { items, status, error } = useAppSelector(
    (state) => state.users.mentees,
  );

  // Mentorando cujo questionário está aberto no modal.
  const [editing, setEditing] = useState<MemberListItem | null>(null);
  // O período é da organização da sessão (a da CREED), só para o mentorando
  // do modal: carrega a cada abertura.
  const period = usePeriod({
    organizationId,
    linkId: editing?.link_id,
    enabled: editing !== null,
  });
  // Por que a última exclusão falhou: aparece dentro do modal de confirmação.
  const [deleteError, setDeleteError] = useState<DeleteMenteeError | null>(
    null,
  );

  useEffect(() => {
    if (organizationId) void dispatch(loadMentees(organizationId));
  }, [dispatch, organizationId]);

  // O toast só depois da resposta do back. Se falhar, o erro volta para o
  // modal, que continua aberto.
  async function handleSaveQuestionnaire(
    mentee: MemberListItem,
    values: ManageQuestionnaireFormValues,
  ) {
    const erro = await period.create(values);
    if (erro) return erro;
    setEditing(null);
    toast.success(t('painelControle:toasts.questionarioNoAr'), {
      description: t('mentees:toasts.questionnaireSaved', {
        name: mentee.name,
      }),
    });
    return null;
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

          {/* Sem organização na sessão não há o que pedir ao back: mesma
              mensagem de quando a carga falha. */}
          {(status === 'error' || !organizationId) && (
            <ErrorState message={t(error ?? 'mentees:loadError')} />
          )}

          {status === 'ready' && organizationId && (
            <MenteesTable
              mentees={items}
              onViewResults={(mentee) => {
                console.log('Ver resultados do mentorando:', mentee.link_id);
                // TODO: integração com o backend
              }}
              onEditQuestionnaire={setEditing}
              deleteErrorMessage={deleteError && t(deleteError)}
              onDelete={async (mentee) => {
                setDeleteError(null);
                const result = await dispatch(
                  deleteMentee({ organizationId, linkId: mentee.link_id }),
                );
                // A falha fica dentro do modal, sem toast
                // (ui-e-responsividade.md): rejeitar mantém o modal aberto.
                if (deleteMentee.rejected.match(result)) {
                  setDeleteError(result.payload ?? 'comum:tabela.erroExcluir');
                  throw new Error('Exclusão do mentorando recusada');
                }
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
            activePeriod={period.activePeriod}
            loading={period.loading}
            onSave={(values) =>
              editing
                ? handleSaveQuestionnaire(editing, values)
                : Promise.resolve(null)
            }
          />
        </CardContent>
      </section>
    </Card>
  );
}
