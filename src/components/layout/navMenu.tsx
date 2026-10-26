import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClipboardPen,
  Info,
  LayoutDashboard,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';
import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-dark.svg';
import { cn } from '@/lib/utils';

type NavMenuPage = 'dashboard' | 'controlPanel';

interface NavMenuProps {
  // Tela atual: o ícone dela fica destacado.
  active?: NavMenuPage;
  // Painel de controle: só empresa e super adm têm.
  showControlPanel?: boolean;
}

function NavMenuButton({
  label,
  isActive = false,
  children,
}: {
  label: string;
  isActive?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'rounded-lg p-2 transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-brand hover:opacity-80',
      )}
    >
      {children}
    </button>
  );
}

// Menu do topo das telas logadas (dashboards e painéis de controle).
export function NavMenu({ active, showControlPanel = false }: NavMenuProps) {
  const { t } = useTranslation(['formulario']);

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-border bg-background p-2 sm:justify-end">
      <NavMenuButton
        label={t('formulario:menuPainel')}
        isActive={active === 'dashboard'}
      >
        <LayoutDashboard size={24} />
      </NavMenuButton>
      {showControlPanel && (
        <NavMenuButton
          label={t('formulario:menuPainelControle')}
          isActive={active === 'controlPanel'}
        >
          <SlidersHorizontal size={24} />
        </NavMenuButton>
      )}
      <NavMenuButton label={t('formulario:menuFormulario')}>
        <ClipboardPen size={24} />
      </NavMenuButton>
      <NavMenuButton label={t('formulario:menuInformacoes')}>
        <Info size={24} />
      </NavMenuButton>
      <CreedSymbol className="size-6" />
      <img src={wordmark} alt="CREED.ai" className="w-24" />
      <NavMenuButton label={t('formulario:menuSair')}>
        <LogOut size={24} />
      </NavMenuButton>
    </div>
  );
}
