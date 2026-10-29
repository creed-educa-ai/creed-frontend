import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ClipboardPen,
  Info,
  LayoutDashboard,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-dark.svg';
import { Separator } from '@/components/ui/separator';
import { logout } from '@/features/authentication/authenticationSlice';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { dashboardPath } from '@/lib/dashboardPath';
import { cn } from '@/lib/utils';

const itemClassName =
  'rounded-lg p-2 text-brand transition-colors hover:opacity-80';

// O destaque do item atual sai do aria-current="page" que o próprio NavLink
// põe, e não de uma className em função: o TooltipTrigger (asChild) junta as
// classes como texto e a função viraria string no atributo class.
const activeClassName =
  'aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground aria-[current=page]:hover:opacity-100';

// O ícone sozinho não diz para onde leva: a dica repete o nome do item. Abre
// embaixo porque o menu fica no topo da tela.
function NavMenuHint({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={4}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function NavMenuLink({
  to,
  label,
  children,
}: {
  to: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <NavMenuHint label={label}>
      <NavLink
        to={to}
        aria-label={label}
        className={cn(itemClassName, activeClassName)}
      >
        {children}
      </NavLink>
    </NavMenuHint>
  );
}

// Menu do topo das telas logadas. Os destinos saem do papel de quem está na
// sessão; sem sessão (login desligado), vale o menor acesso: o de respondente.
export function NavMenu() {
  const { t } = useTranslation(['formulario']);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const role = useAppSelector((state) => state.authentication.user?.role);

  // 🟡 P-055: o admin é a cliente (CREED) e vai ao painel do super adm; o
  // gestor, ao painel da empresa dele; o respondente não tem painel.
  const controlPanelPath =
    role === 'admin'
      ? '/control-panel/admin'
      : role === 'gestor'
        ? '/control-panel'
        : null;

  function handleLogout() {
    dispatch(logout());
    navigate('/', { replace: true });
  }

  return (
    <TooltipProvider>
      <nav
        aria-label={t('formulario:menuNavegacao')}
        className="flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-border bg-background p-2 sm:justify-end"
      >
        {/* A marca abre o menu; o Sair fecha, separado dos destinos por ser
            uma ação, não uma tela. */}
        <div className="mr-4 flex items-center gap-1.5">
          {/* Ajuste ótico, medido em print: centrado na caixa do wordmark o
              símbolo parece alto (a haste do "d" puxa o centro para cima, e o
              corpo das letras fica ~3px abaixo); alinhado ao corpo, parece
              baixo. Metade do caminho é o que lê como centralizado. */}
          <CreedSymbol className="size-8 translate-y-[1.5px] text-primary" />
          <img src={wordmark} alt="CREED.ai" className="h-5" />
        </div>
        <NavMenuLink
          to={dashboardPath(role)}
          label={t('formulario:menuPainel')}
        >
          <LayoutDashboard size={24} />
        </NavMenuLink>
        {controlPanelPath && (
          <NavMenuLink
            to={controlPanelPath}
            label={t('formulario:menuPainelControle')}
          >
            <SlidersHorizontal size={24} />
          </NavMenuLink>
        )}
        <NavMenuLink to="/questionnaire" label={t('formulario:menuFormulario')}>
          <ClipboardPen size={24} />
        </NavMenuLink>
        <NavMenuLink to="/about" label={t('formulario:menuInformacoes')}>
          <Info size={24} />
        </NavMenuLink>
        {/* self-center: o primitivo estica (self-stretch), o que com altura
            fixa prendia o separador no topo da linha. */}
        <Separator
          orientation="vertical"
          className="mx-2 h-8 data-vertical:w-0.5 data-vertical:self-center"
        />
        <NavMenuHint label={t('formulario:menuSair')}>
          <button
            type="button"
            aria-label={t('formulario:menuSair')}
            onClick={handleLogout}
            className={itemClassName}
          >
            <LogOut size={24} />
          </button>
        </NavMenuHint>
      </nav>
    </TooltipProvider>
  );
}
