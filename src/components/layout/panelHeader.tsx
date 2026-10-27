import { NavMenu } from '@/components/layout/navMenu';

interface PanelHeaderProps {
  // Linha de cima: o nome da organização, ou "Administradora" no super adm.
  eyebrow: string | null;
  title: string;
  subtitle: string;
}

// Topo dos painéis de controle (empresa e super adm).
export function PanelHeader({ eyebrow, title, subtitle }: PanelHeaderProps) {
  return (
    <header className="flex w-full flex-col items-center justify-center gap-4 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
      <div className="text-center sm:text-left">
        <p className="text-sm font-bold text-heading">{eyebrow}</p>
        <h1 className="text-3xl font-bold text-heading">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <NavMenu active="controlPanel" showControlPanel />
    </header>
  );
}
