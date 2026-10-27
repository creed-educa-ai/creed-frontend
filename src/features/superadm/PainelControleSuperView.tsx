import { useTranslation } from 'react-i18next';
import { PanelHeader } from '@/components/layout/panelHeader';
import { SectionHeader } from '@/components/layout/sectionHeader';
import { MenteesSection } from '@/features/mentees/MenteesSection';
import { CompaniesSection } from '@/features/organizations-admin/CompaniesSection';
import { AdicionarMentorando } from './AdicionarMentorando';
import type { AdicionarMentorandoValues } from './adicionarMentorandoSchema';

// Painel de controle do super adm (a cliente): convidar mentorandos e
// acompanhar empresas e mentorandos.
export function PainelControleSuperView() {
  const { t } = useTranslation(['painelControle', 'adicionarMentorando']);

  function handleAdicionar(values: AdicionarMentorandoValues) {
    console.log('Mentorando adicionado:', values);
    // TODO: INTEGRAÇÃO BACKEND
  }

  return (
    <div className="flex min-h-svh flex-col overflow-hidden bg-background">
      <PanelHeader
        eyebrow={t('painelControle:administradora')}
        title={t('painelControle:titulo')}
        subtitle={t('painelControle:subtituloAdmin')}
      />

      {/* Tudo em uma coluna, na largura toda: "Adicionar" e as duas tabelas,
          uma embaixo da outra. */}
      <main className="flex flex-col gap-8 px-6 pb-10">
        <section className="flex flex-col gap-4">
          <SectionHeader>{t('adicionarMentorando:titulo')}</SectionHeader>
          <AdicionarMentorando onSubmit={handleAdicionar} />
        </section>

        <CompaniesSection />
        <MenteesSection />
      </main>
    </div>
  );
}
