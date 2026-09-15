import { useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { TermoModal } from '@/components/modals/TermoModal';
import { logout } from '@/features/authentication/authenticationSlice';

interface ProtectedRouteProps {
  enabled?: boolean;
}

export function ProtectedRoute({ enabled = true }: ProtectedRouteProps) {
  const user = useAppSelector((state) => state.authentication.user);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  // PROVISÓRIO — para a apresentação, o termo aparece SEMPRE: a cada entrada
  // na área logada (login ou recarregar a página), sem lembrar aceite
  // anterior. O aceite vale só enquanto a pessoa navega pela área logada: esta
  // guarda continua montada entre as telas filhas, então o estado não se perde
  // de uma etapa para outra.
  const [termoAceito, setTermoAceito] = useState(false);

  if (enabled && !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Fica aqui, na porta da área logada, e não na tela de login: assim também
  // vale para quem volta com a sessão salva. Nenhuma tela protegida é montada
  // antes do aceite.
  if (enabled && user && !termoAceito) {
    return (
      <TermoModal
        open
        onOpenChange={() => undefined}
        // Depois do aceite vêm sempre os dados demográficos (fluxoDemograficos).
        // replace: a rota por trás do termo (em geral /respondentes) sai do
        // histórico, e a seta de voltar da etapa 1 não cai numa tela que a
        // pessoa nunca viu.
        onAccept={() => {
          setTermoAceito(true);
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
