import { createBrowserRouter, Navigate } from 'react-router-dom';
import {
  Demograficos1Etapa,
  Demograficos2Etapa,
  Demograficos3Etapa,
} from '@/features/respondentes/fluxoDemograficos';
import { CadastroView } from '@/features/cadastro/CadastroView';
import { RecuperarSenhaView } from '@/features/authentication/RecuperarSenhaView';
import { SobreView } from '@/features/sobre/SobreView';
import { BoasVindasView } from '@/features/boas-vindas/BoasVindasView';
import { AguardeConfirmacaoView } from '@/features/aguarde-confirmacao/AguardeConfirmacaoView';
import { LoginView } from '@/features/authentication/LoginView';
import { ProtectedRoute } from '@/app/ProtectedRoute';
import { OnboardQuestionarioView } from '@/features/responses/OnboardQuestionarioView';
import { FormView } from '@/features/responses/FormView';
import { RevisaoRespostasRoute } from '@/features/responses/RevisaoRespostasRoute';
import { SubmissionConfirmationView } from '@/features/responses/SubmissionConfirmationView';
import { UserDashboardView } from '@/features/dashboards/UserDashboardView';
import { CompanyDashboardView } from '@/features/dashboards/CompanyDashboardView';
import { PainelControleView } from '@/features/painel-de-controle/PainelControleView';
import { PainelControleSuperView } from '@/features/superadm/PainelControleSuperView';

const loginHabilitado = import.meta.env.VITE_LOGIN_ENABLED !== 'false';

export const router = createBrowserRouter([
  // A plataforma abre na tela de boas-vindas, inclusive para quem já tem
  // sessão: `/` não lê o estado de autenticação.
  { path: '/', element: <BoasVindasView /> },
  {
    path: '/login',
    // Com o login desligado, o botão "Entrar" das boas-vindas pula direto para
    // a área logada em vez de cair numa rota inexistente. Sem sessão não há
    // papel: vai para o dashboard individual (P-054).
    element: loginHabilitado ? (
      <LoginView />
    ) : (
      <Navigate to="/dashboard" replace />
    ),
  },
  {
    element: <ProtectedRoute enabled={loginHabilitado} />,
    // Os dados demográficos ficam atrás da mesma guarda da área logada: só
    // quem entrou e aceitou o termo chega neles (fluxo em fluxoDemograficos).
    // Os dashboards e os painéis também: o login leva ao dashboard, e é a
    // guarda que mostra o termo no primeiro acesso.
    children: [
      { path: '/dashboard', element: <UserDashboardView /> },
      { path: '/dashboard/company', element: <CompanyDashboardView /> },
      { path: '/control-panel', element: <PainelControleView /> },
      { path: '/control-panel/admin', element: <PainelControleSuperView /> },
      { path: '/demographics/step-1', element: <Demograficos1Etapa /> },
      { path: '/demographics/step-2', element: <Demograficos2Etapa /> },
      { path: '/demographics/step-3', element: <Demograficos3Etapa /> },
      { path: '/questionnaire', element: <OnboardQuestionarioView /> },
      { path: '/questionnaire/questions', element: <FormView /> },
      {
        path: '/questionnaire/review',
        element: <RevisaoRespostasRoute />,
      },
      {
        path: '/questionnaire/submitted',
        element: <SubmissionConfirmationView />,
      },
    ],
  },
  { path: '/about', element: <SobreView /> },
  { path: '/sign-up', element: <CadastroView /> },
  { path: '/awaiting-confirmation', element: <AguardeConfirmacaoView /> },
  // Sem rota de primeiro acesso: a senha é definida na página do Keycloak,
  // pelo link do convite (P-012). Aqui só se pede o link de nova senha.
  { path: '/reset-password', element: <RecuperarSenhaView /> },
]);
