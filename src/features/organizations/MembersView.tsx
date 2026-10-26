import { SeletorIdioma } from '@/components/SeletorIdioma';
import { MembersSection } from '@/features/organizations/MembersSection';

export function MembersView() {
  return (
    <section className="min-h-svh bg-background p-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <div className="flex justify-end">
          <SeletorIdioma />
        </div>

        <MembersSection />
      </div>
    </section>
  );
}
