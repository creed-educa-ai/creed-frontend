import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/pageHeader';
import { SectionHeader } from '@/components/layout/sectionHeader';
import { AddMemberForm } from '@/features/organizations/AddMemberForm';
import type { AddMemberValues } from '@/features/organizations/addMemberSchema';
import { MembersSection } from '@/features/organizations/MembersSection';
import { screenEnterClassName } from '@/lib/animations';
import { cn } from '@/lib/utils';
import {
  gerenciarQuestionarioSchema,
  type GerenciarQuestionarioFormValues,
} from './GerenciarQuestionarioSchema';
import { GerenciarQuestionario } from './GerenciarQuestionario';

// Painel de controle da empresa: convidar membros, abrir o período do
// questionário e acompanhar os membros.
export function PainelControleView() {
  const { t } = useTranslation(['painelControle']);
  // O nome chega junto com a lista de membros, que o MembersSection carrega.
  const organization = useAppSelector(
    (state) => state.organizations.organization,
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GerenciarQuestionarioFormValues>({
    resolver: zodResolver(gerenciarQuestionarioSchema),
    defaultValues: {
      dataInicio: '',
      horaInicio: '',
      dataLimite: '',
      horaLimite: '',
    },
  });

  const onSubmit = (data: GerenciarQuestionarioFormValues) => {
    console.log('Dados salvos:', data);
    // TODO: Lógica de integração com o backend
  };

  function handleAddMember(values: AddMemberValues) {
    console.log('Membro adicionado:', values);
    // TODO: integração — o organizationsApi ainda não tem convite de membro
  }

  return (
    <div className="flex min-h-svh flex-col overflow-hidden bg-background">
      <PageHeader eyebrow={organization} title={t('painelControle:titulo')} />

      {/* Ações lado a lado (adicionar membro, período do questionário) e a
          tabela de membros embaixo, na largura toda. No celular, tudo numa
          coluna, nessa ordem. */}
      <main
        className={cn('flex flex-col gap-8 px-6 pb-10', screenEnterClassName)}
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Sem recolher, ao contrário do dashboard: o painel é curto e as
              seções são as ações da tela. flex-1 nivela os cards da linha. */}
          <section className="flex flex-col gap-4">
            <SectionHeader>{t('painelControle:adicionarMembro')}</SectionHeader>
            <div className="flex-1 rounded-3xl bg-card p-6 shadow-sm">
              <AddMemberForm onSubmit={handleAddMember} />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <SectionHeader>{t('painelControle:gerenciar')}</SectionHeader>
            <div className="flex-1">
              <GerenciarQuestionario
                control={control}
                errors={errors}
                onConfirmar={() => {
                  void handleSubmit(onSubmit)();
                }}
              />
            </div>
          </section>
        </div>

        <MembersSection />
      </main>
    </div>
  );
}
