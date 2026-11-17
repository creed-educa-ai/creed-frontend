import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { TermsModal } from '@/components/modals/TermsModal';
import { logout } from '@/features/authentication/authenticationSlice';
import {
  recordTermsAcceptance,
  hasAcceptedTerms,
} from '@/features/authentication/termsAcceptance';
import { DemographicsGate } from '@/features/demographics/demographicsFlow';

interface ProtectedRouteProps {
  enabled?: boolean;
}

export function ProtectedRoute({ enabled = true }: ProtectedRouteProps) {
  const user = useAppSelector((state) => state.authentication.user);
  const dispatch = useAppDispatch();
  const location = useLocation();
  // O aceite mora no localStorage, que não avisa o React quando muda: este
  // estado é o que faz a tela re-renderizar logo depois do clique em Aceitar.
  const [acceptedUserId, setAcceptedUserId] = useState<string | null>(null);

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
  // disso, nenhum dado da plataforma é carregado.
  if (
    enabled &&
    user &&
    acceptedUserId !== user.id &&
    !hasAcceptedTerms(user.id)
  ) {
    return (
      <TermsModal
        open
        onOpenChange={() => undefined}
        onAccept={() => {
          recordTermsAcceptance(user.id);
          setAcceptedUserId(user.id);
        }}
        // Sem aceitar, não usa a plataforma: desloga, e o redirecionamento
        // acima leva de volta ao login.
        onDecline={() => {
          dispatch(logout());
        }}
      />
    );
  }

  // O aceite é local e pode existir mesmo quando o onboarding ficou incompleto.
  return enabled ? <DemographicsGate /> : <Outlet />;
}
