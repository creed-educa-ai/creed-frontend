import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { dashboardsApi } from '@/features/dashboards/dashboardsApi';
import { ApiError } from '@/lib/apiClient';

// A casa de quem acaba de entrar. Fica atrás da guarda da área logada (termo e
// perfil demográfico), e é por isso que a busca do resultado mora aqui, e não
// no login: antes do aceite, nenhum dado da plataforma é carregado.
//
// A admin e a gestora caem no painel de controle, que é onde trabalham. Quem
// responde cai no próprio resultado; sem resultado ainda (404), no
// questionário, que é o que há para fazer.
export function HomeRedirect() {
  const { t } = useTranslation('comum');
  const role = useAppSelector((state) => state.authentication.user?.role);
  const answers = role !== 'admin' && role !== 'gestor';
  const [destino, setDestino] = useState<string | null>(null);

  useEffect(() => {
    if (!answers) return;
    const controle = new AbortController();
    dashboardsApi.getUserDashboard({}, controle.signal).then(
      () => {
        setDestino('/dashboard');
      },
      (erro: unknown) => {
        if (controle.signal.aborted) return;
        // Outra falha não decide nada: o dashboard mostra o erro e deixa
        // tentar de novo.
        setDestino(
          erro instanceof ApiError && erro.status === 404
            ? '/questionnaire'
            : '/dashboard',
        );
      },
    );
    return () => {
      controle.abort();
    };
  }, [answers]);

  if (role === 'admin') return <Navigate to="/control-panel/admin" replace />;
  if (role === 'gestor') return <Navigate to="/control-panel" replace />;
  if (destino) return <Navigate to={destino} replace />;

  return (
    <p
      role="status"
      className="flex min-h-svh items-center justify-center text-sm text-muted-foreground"
    >
      {t('carregando')}
    </p>
  );
}
