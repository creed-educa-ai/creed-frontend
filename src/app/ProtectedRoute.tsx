import { useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { TermoModal } from '@/components/modals/TermoModal';
import { logout } from '@/features/authentication/authenticationSlice';
import {
  registrarAceiteDoTermo,
  termoFoiAceito,
} from '@/features/authentication/termoAceito';

interface ProtectedRouteProps {
  enabled?: boolean;
}

export function ProtectedRoute({ enabled = true }: ProtectedRouteProps) {
  const user = useAppSelector((state) => state.authentication.user);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  // O aceite mora no localStorage, que não avisa o React quando muda: este
  // estado é o que faz a tela re-renderizar logo depois do clique em Aceitar.
  const [aceitouAgora, setAceitouAgora] = useState(false);

  if (enabled && !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Termo de consentimento no primeiro acesso. Fica aqui, na porta da área
  // logada, e não na tela de login: assim também vale para quem volta com a
  // sessão salva. A tela protegida só é montada depois do aceite — antes
  // disso, nenhum dado da plataforma é carregado.
  if (enabled && user && !aceitouAgora && !termoFoiAceito(user.id)) {
    return (
      <TermoModal
        open
        onOpenChange={() => undefined}
        // Depois do aceite vêm sempre os dados demográficos (fluxoDemograficos):
        // o termo só aparece no primeiro acesso, e é nele que o onboarding começa.
        // Quem já aceitou antes não passa por aqui e vai direto ao destino.
        // replace: a rota por trás do termo (em geral /respondentes) sai do
        // histórico, e a seta de voltar da etapa 1 não cai numa tela que a
        // pessoa nunca viu.
        onAccept={() => {
          registrarAceiteDoTermo(user.id);
          setAceitouAgora(true);
          navigate('/demograficos-1', { replace: true });
        }}
        // Sem aceitar, não usa a plataforma: desloga, e o redirecionamento
        // acima leva de volta ao login.
        onDecline={() => {
          dispatch(logout());
        }}
      />
    );
  }

  return <Outlet />;
}
