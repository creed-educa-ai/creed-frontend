import { SeletorIdioma } from '@/components/SeletorIdioma';
import { CompaniesSection } from '@/features/organizations-admin/CompaniesSection';

// Página só da tabela de empresas. No produto, ela aparece no painel do super
// adm (/control-panel/admin).
export function OrganizationsAdminView() {
  return (
    <section className="min-h-svh bg-background p-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <div className="flex justify-end">
          <SeletorIdioma />
        </div>

        <CompaniesSection />
      </div>
    </section>
  );
}
