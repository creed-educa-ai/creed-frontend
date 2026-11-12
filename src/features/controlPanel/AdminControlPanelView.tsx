import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
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
import { inviteMentee, loadMentees } from '@/features/users/usersSlice';
import { Card, CardContent } from '@/components/ui/card';
import { cardTitleClassName } from '@/lib/typography';

// Painel de controle do super adm (a cliente): convidar mentorandos e
// acompanhar empresas e mentorandos.
export function AdminControlPanelView() {
  const { t } = useTranslation(['painelControle', 'adicionarMentorando']);
  const dispatch = useAppDispatch();
  // A organização da sessão é a da CREED (P-048): é nela que o mentorando
  // entra, com vínculo `mentoria`.
  const organizationId = useAppSelector(
    (state) => state.authentication.user?.organization_id ?? null,
  );

  // Se o convite falhar, o `unwrap` rejeita com a chave do erro, e o
  // formulário a mostra no campo ou embaixo dele. O toast e a recarga da
  // tabela só vêm depois que o back respondeu 201.
  async function handleAdicionar(values: AddMemberValues) {
    await dispatch(
      inviteMentee({ organizationId, name: values.name, email: values.email }),
    ).unwrap();
    if (organizationId) void dispatch(loadMentees(organizationId));
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
