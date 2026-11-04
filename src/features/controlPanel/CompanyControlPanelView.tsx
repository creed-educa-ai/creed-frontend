import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/pageHeader';
import { pageGutterClassName } from '@/lib/layout';
import { SectionHeader } from '@/components/layout/sectionHeader';
import { toast } from '@/components/ui/sonner';
import { AddMemberForm } from '@/features/users/AddMemberForm';
import type { AddMemberValues } from '@/features/users/addMemberSchema';
import { MembersSection } from '@/features/users/MembersSection';
import { screenEnterClassName } from '@/lib/animations';
import { cardTitleClassName } from '@/lib/typography';
import { cn } from '@/lib/utils';
import {
  manageQuestionnaireSchema,
  type ManageQuestionnaireFormValues,
} from '@/features/forms/manageQuestionnaireSchema';
import { ManageQuestionnaire } from '@/features/forms/ManageQuestionnaire';
import { Card, CardContent } from '@/components/ui/card';

// Painel de controle da empresa: convidar membros, abrir o período do
// questionário e acompanhar os membros.
export function CompanyControlPanelView() {
  const { t } = useTranslation(['painelControle', 'organizations']);
  // O nome chega junto com a lista de membros, que o MembersSection carrega.
  const organization = useAppSelector((state) => state.users.organization);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ManageQuestionnaireFormValues>({
    resolver: zodResolver(manageQuestionnaireSchema),
    defaultValues: {
      dataInicio: '',
      horaInicio: '',
      dataLimite: '',
      horaLimite: '',
    },
  });

  const onSubmit = (data: ManageQuestionnaireFormValues) => {
    console.log('Dados salvos:', data);
    // TODO: integração — o back não tem onde guardar o período: `FormRead`
    // não tem início nem término, só `status` (draft/published/closed).
    // Integrado, o toast vem depois do `await` do salvamento.
    toast.success(t('painelControle:toasts.questionarioNoAr'), {
      description: t('painelControle:toasts.questionarioNoArDescricao'),
    });
  };

  function handleAddMember(values: AddMemberValues) {
    console.log('Membro adicionado:', values);
    // TODO: integração — `usersApi.inviteMember(organization_id da sessão,
    // values)`, por um thunk no usersSlice. A rota está na branch
    // feat/86e35vhxm-convite-de-membro do back, ainda fora da dev.
    // Integrado, o toast vem depois do `await` do convite.
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
                    <ManageQuestionnaire
                      control={control}
                      errors={errors}
                      onConfirmar={() => {
                        void handleSubmit(onSubmit)();
                      }}
                    />
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
