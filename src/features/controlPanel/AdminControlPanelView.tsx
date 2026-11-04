import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/pageHeader';
import { pageGutterClassName } from '@/lib/layout';
import { screenEnterClassName } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { SectionHeader } from '@/components/layout/sectionHeader';
import { toast } from '@/components/ui/sonner';
import { MenteesSection } from '@/features/users/MenteesSection';
import { CompaniesSection } from '@/features/organizations/CompaniesSection';
import { AddMemberForm } from '@/features/users/AddMemberForm';
import type { AddMemberValues } from '@/features/users/addMemberSchema';
import { Card, CardContent } from '@/components/ui/card';
import { cardTitleClassName } from '@/lib/typography';

// Painel de controle do super adm (a cliente): convidar mentorandos e
// acompanhar empresas e mentorandos.
export function AdminControlPanelView() {
  const { t } = useTranslation(['painelControle', 'adicionarMentorando']);

  // Sem o seletor de função, `role` chega sempre `respondente`, o papel do
  // mentorando no convite.
  function handleAdicionar(values: AddMemberValues) {
    console.log('Mentorando adicionado:', values);
    // TODO: integração — `usersApi.inviteMember(<id da organização CREED>,
    // { name, email, role: 'respondente', type: 'mentoria' })`. Falta à tela
    // o id da organização CREED.
    // Integrado, o toast vem depois do `await` do convite.
    toast.success(t('painelControle:toasts.conviteEnviado'), {
      description: t('painelControle:toasts.conviteEnviadoDescricao', {
        email: values.email,
      }),
    });
  }

  return (
    <div className="flex min-h-svh flex-col overflow-hidden bg-background">
      <PageHeader
        eyebrow={t('painelControle:administradora')}
        title={t('painelControle:titulo')}
      />

      {/* "Controles", como no painel da empresa: o card "Adicionar mentorando"
          na largura toda, com nome, e-mail e Adicionar numa linha. Embaixo,
          "Membros": um separador só para as duas tabelas, cada uma com o
          título no próprio card. Uma embaixo da outra até o desktop cheio
          (2xl), lado a lado dali para cima. */}
      <main
        className={cn(
          'flex flex-col gap-8 pb-10',
          pageGutterClassName,
          screenEnterClassName,
        )}
      >
        <section className="flex flex-col gap-4">
          <SectionHeader>{t('painelControle:controles')}</SectionHeader>
          <Card asChild>
            <section>
              <CardContent className="flex flex-col gap-4">
                <h3 className={cardTitleClassName}>
                  {t('adicionarMentorando:titulo')}
                </h3>
                <AddMemberForm onSubmit={handleAdicionar} withRole={false} />
              </CardContent>
            </section>
          </Card>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeader>{t('painelControle:membros')}</SectionHeader>
          <div className="grid grid-cols-1 gap-8 2xl:grid-cols-2">
            <CompaniesSection />
            <MenteesSection />
          </div>
        </section>
      </main>
    </div>
  );
}
