import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/pageHeader';
import { pageGutterClassName } from '@/lib/layout';
import { SectionHeader } from '@/components/layout/sectionHeader';
import { toast } from '@/components/ui/sonner';
import { AddMemberForm } from '@/features/users/AddMemberForm';
import type { AddMemberValues } from '@/features/users/addMemberSchema';
import { MembersSection } from '@/features/users/MembersSection';
import { inviteMember, loadMembers } from '@/features/users/usersSlice';
import { screenEnterClassName } from '@/lib/animations';
import { cardTitleClassName } from '@/lib/typography';
import { cn } from '@/lib/utils';
import {
  manageQuestionnaireSchema,
  type ManageQuestionnaireFormValues,
} from '@/features/forms/manageQuestionnaireSchema';
import { ManageQuestionnaire } from '@/features/forms/ManageQuestionnaire';
import { usePeriod } from '@/features/forms/usePeriod';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingState } from '@/components/states/LoadingState';
import { Skeleton } from '@/components/ui/skeleton';

// Painel de controle da empresa: convidar membros, abrir o período do
// questionário e acompanhar os membros.
export function CompanyControlPanelView() {
  const { t } = useTranslation(['painelControle', 'organizations']);
  const dispatch = useAppDispatch();
  // O nome chega junto com a lista de membros, que o MembersSection carrega.
  const organization = useAppSelector((state) => state.users.organization);
  // O período é da organização do vínculo de quem está logado (o gestor).
  const organizationId = useAppSelector(
    (state) => state.authentication.user?.organization_id ?? null,
  );
  const period = usePeriod({ organizationId });

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ManageQuestionnaireFormValues>({
    resolver: zodResolver(manageQuestionnaireSchema),
    defaultValues: {
      dataInicio: '',
      horaInicio: '',
      dataLimite: '',
      horaLimite: '',
    },
  });

  // O toast só depois da resposta do back. Se falhar, a mensagem fica no
  // formulário, com os campos como estavam.
  const onSubmit = async (data: ManageQuestionnaireFormValues) => {
    const erro = await period.create(data);
    if (erro) {
      setError('root', { message: erro });
      return;
    }
    reset();
    toast.success(t('painelControle:toasts.questionarioNoAr'), {
      description: t('painelControle:toasts.questionarioNoArDescricao'),
    });
  };

  // Se o convite falhar, o `unwrap` rejeita com a chave do erro, e o
  // formulário a mostra no campo ou embaixo dele. O toast e a recarga da
  // tabela só vêm depois que o back respondeu 201.
  async function handleAddMember(values: AddMemberValues) {
    await dispatch(inviteMember({ organizationId, invite: values })).unwrap();
    if (organizationId) void dispatch(loadMembers(organizationId));
    toast.success(t('painelControle:toasts.conviteEnviado'), {
      description: t('painelControle:toasts.conviteEnviadoDescricao', {
        email: values.email,
      }),
    });
  }

  return (
    <div className="flex min-h-svh flex-col overflow-hidden bg-background">
      <PageHeader eyebrow={organization} title={t('painelControle:titulo')} />

      {/* "Controles": um separador só para os dois cards de ação (adicionar
          membro, período do questionário), lado a lado, cada um com o título
          dentro. Embaixo, na largura toda, o separador com o nome da empresa
          e o card "Membros". No celular, tudo numa coluna, nessa ordem. */}
      <main
        className={cn(
          'flex flex-col gap-8 pb-10',
          pageGutterClassName,
          screenEnterClassName,
        )}
      >
        <section className="flex flex-col gap-4">
          <SectionHeader>{t('painelControle:controles')}</SectionHeader>
          {/* Sem recolher, ao contrário do dashboard: o painel é curto e os
              cards são as ações da tela. O grid nivela a altura dos dois. */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card asChild>
              <section>
                <CardContent className="flex flex-col gap-4">
                  <h3 className={cardTitleClassName}>
                    {t('painelControle:adicionarMembro')}
                  </h3>
                  <AddMemberForm onSubmit={handleAddMember} />
                </CardContent>
              </section>
            </Card>

            <Card asChild>
              <section>
                <CardContent className="flex flex-col gap-4">
                  <h3 className={cardTitleClassName}>
                    {t('painelControle:gerenciar')}
                  </h3>
                  <div className="flex-1">
                    {period.loading ? (
                      <LoadingState>
                        <Skeleton className="h-24 w-full" />
                      </LoadingState>
                    ) : (
                      <ManageQuestionnaire
                        control={control}
                        errors={errors}
                        enviando={isSubmitting}
                        periodoAtivo={period.activePeriod}
                        onConfirmar={() => {
                          void handleSubmit(onSubmit)();
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </section>
            </Card>
          </div>
        </section>

        {/* Sem o nome (carregando ou erro), o separador diz só "Membros da
            empresa". */}
        <section className="flex flex-col gap-4">
          <SectionHeader>
            {organization || t('organizations:members.table')}
          </SectionHeader>
          <MembersSection />
        </section>
      </main>
    </div>
  );
}
