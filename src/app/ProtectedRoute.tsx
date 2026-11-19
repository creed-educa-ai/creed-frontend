import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useTranslation } from 'react-i18next';
import { TermsModal } from '@/components/modals/TermsModal';
import { toast } from '@/components/ui/sonner';
import {
  acceptTerms,
  logout,
} from '@/features/authentication/authenticationSlice';
import { DemographicsGate } from '@/features/demographics/demographicsFlow';

interface ProtectedRouteProps {
  enabled?: boolean;
}

export function ProtectedRoute({ enabled = true }: ProtectedRouteProps) {
  const user = useAppSelector((state) => state.authentication.user);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { t } = useTranslation(['termo']);

  if (enabled && !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // A admin não responde questionário: só administra e vê os dashboards. O
  // termo e o perfil demográfico existem para quem responde, então ela entra
  // direto.
  if (user?.role === 'admin') {
    return <Outlet />;
  }

  // Termo de consentimento no primeiro acesso. Fica aqui, na porta da área
  // logada, e não na tela de login: assim também vale para quem volta com a
  // sessão salva. A tela protegida só é montada depois do aceite — antes
  // disso, nenhum dado da plataforma é carregado. O aceite mora no back
  // (`terms_accepted_at` da sessão).
  if (enabled && user && !user.terms_accepted_at) {
    return (
      <TermsModal
        open
        onOpenChange={() => undefined}
        // Se o back não registrar, o termo continua na tela: sem aceite gravado,
        // não entra.
        onAccept={() => {
          void dispatch(acceptTerms())
            .unwrap()
            .catch(() => toast.error(t('termo:erroAoAceitar')));
        }}
        // Sem aceitar, não usa a plataforma: desloga, e o redirecionamento
        // acima leva de volta ao login.
        onDecline={() => {
          dispatch(logout());
        }}
      />
    );
  }

  // O aceite pode existir mesmo quando o onboarding ficou incompleto.
  return enabled ? <DemographicsGate /> : <Outlet />;
}
