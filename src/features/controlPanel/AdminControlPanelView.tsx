import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/pageHeader';
import { pageGutterClassName } from '@/lib/layout';
import { cn } from '@/lib/utils';
import { SectionHeader } from '@/components/layout/sectionHeader';
import { MenteesSection } from '@/features/users/MenteesSection';
import { CompaniesSection } from '@/features/organizations/CompaniesSection';
import { AddMenteeForm } from '@/features/users/AddMenteeForm';
import type { AddMenteeValues } from '@/features/users/addMenteeSchema';

// Painel de controle do super adm (a cliente): convidar mentorandos e
// acompanhar empresas e mentorandos.
export function AdminControlPanelView() {
  const { t } = useTranslation(['painelControle', 'adicionarMentorando']);

  function handleAdicionar(values: AddMenteeValues) {
    console.log('Mentorando adicionado:', values);
    // TODO: integração — `usersApi.inviteMember(<id da organização CREED>,
    // { name, email, role: 'respondente', type: 'mentoria' })`. Falta à tela o
    // nome da pessoa, que o convite exige (P-046), e o id da organização.
  }

  return (
    <div className="flex min-h-svh flex-col overflow-hidden bg-background">
      <PageHeader
        eyebrow={t('painelControle:administradora')}
        title={t('painelControle:titulo')}
      />

      {/* Tudo em uma coluna, na largura toda: "Adicionar" e as duas tabelas,
          uma embaixo da outra. */}
      <main className={cn('flex flex-col gap-8 pb-10', pageGutterClassName)}>
        <section className="flex flex-col gap-4">
          <SectionHeader>{t('adicionarMentorando:titulo')}</SectionHeader>
          <AddMenteeForm onSubmit={handleAdicionar} />
        </section>

        <CompaniesSection />
        <MenteesSection />
      </main>
    </div>
  );
}
