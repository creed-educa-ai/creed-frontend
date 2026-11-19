import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { MembersTable } from '@/features/users/MembersTable';
import {
  deleteMember,
  loadMembers,
  updateMemberTag,
} from '@/features/users/usersSlice';
import type { DepartmentType } from '@/types/api';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { cardTitleClassName } from '@/lib/typography';

// Card "Membros": carrega os membros e cobre os estados de carregando, erro e
// pronto. O separador com o nome da empresa é do painel de controle.
export function MembersSection() {
  const { t } = useTranslation(['comum', 'organizations']);
  const dispatch = useAppDispatch();
  const { members, status, error } = useAppSelector((state) => state.users);

  // Os membros são da organização do vínculo de quem está logado (o gestor).
  const organizationId = useAppSelector(
    (state) => state.authentication.user?.organization_id ?? null,
  );

  useEffect(() => {
    if (organizationId) {
      void dispatch(loadMembers(organizationId));
    }
  }, [dispatch, organizationId]);

  // O toast vem depois do `unwrap`: se a exclusão falhar, quem avisa é o
  // diálogo de confirmação, que continua aberto.
  async function handleDelete(id: string) {
    if (!organizationId) return;
    const name = members.find((member) => member.id === id)?.name ?? '';
    await dispatch(deleteMember({ organizationId, id })).unwrap();
    toast.success(t('organizations:toasts.membroExcluido'), {
      description: t('organizations:toasts.membroExcluidoDescricao', {
        nome: name,
      }),
    });
  }

  // A troca de tag é imediata, sem botão de salvar: o toast confirma.
  async function handleChangeTag(id: string, tag: DepartmentType | null) {
    if (!organizationId) return;
    const name = members.find((member) => member.id === id)?.name ?? '';
    try {
      await dispatch(updateMemberTag({ organizationId, id, tag })).unwrap();
      toast.success(t('organizations:toasts.tagAtualizada'), {
        description: tag
          ? t('organizations:toasts.tagAtualizadaDescricao', {
              nome: name,
              tag: t(`setores.${tag}`),
            })
          : t('organizations:toasts.tagRemovidaDescricao', { nome: name }),
      });
    } catch {
      toast.error(t('organizations:toasts.erroTag'), {
        description: t('tenteNovamenteEmInstantes'),
      });
    }
  }

  return (
    // O card é a seção: o título fica dentro dele, como nos cards do
    // dashboard e do painel do admin.
    <Card asChild>
      <section>
        <CardContent className="flex flex-col gap-4">
          <h3 className={cardTitleClassName}>
            {t('organizations:members.title')}
          </h3>
          {status === 'loading' && (
            <LoadingState>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-40 w-full" />
            </LoadingState>
          )}

          {status === 'error' && <ErrorState message={error && t(error)} />}

          {status === 'ready' && (
            <MembersTable
              members={members}
              onDelete={handleDelete}
              onChangeTag={(id, tag) => {
                void handleChangeTag(id, tag);
              }}
            />
          )}
        </CardContent>
      </section>
    </Card>
  );
}
