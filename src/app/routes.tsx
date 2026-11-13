import { createBrowserRouter, Navigate } from 'react-router-dom';
import {
  DemographicsStep1Route,
  DemographicsStep2Route,
  DemographicsStep3Route,
} from '@/features/demographics/demographicsFlow';
import { SignUpView } from '@/features/organizations/SignUpView';
import { PasswordResetView } from '@/features/authentication/PasswordResetView';
import { AboutView } from '@/features/about/AboutView';
import { WelcomeView } from '@/features/welcome/WelcomeView';
import { AwaitingConfirmationView } from '@/features/organizations/AwaitingConfirmationView';
import { LoginView } from '@/features/authentication/LoginView';
import { ProtectedRoute } from '@/app/ProtectedRoute';
import { QuestionnaireOnboardingView } from '@/features/responses/QuestionnaireOnboardingView';
import { FormView } from '@/features/responses/FormView';
import { AnswersReviewRoute } from '@/features/responses/AnswersReviewRoute';
import { SubmissionConfirmationView } from '@/features/responses/SubmissionConfirmationView';
import { UserDashboardView } from '@/features/dashboards/UserDashboardView';
import { CompanyDashboardRoute } from '@/features/dashboards/AdminDashboardView';
import { CompanyControlPanelView } from '@/features/controlPanel/CompanyControlPanelView';
import { AdminControlPanelView } from '@/features/controlPanel/AdminControlPanelView';

const loginHabilitado = import.meta.env.VITE_LOGIN_ENABLED !== 'false';

export const router = createBrowserRouter([
  // A plataforma abre na tela de boas-vindas, inclusive para quem já tem
  // sessão: `/` não lê o estado de autenticação.
  { path: '/', element: <WelcomeView /> },
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
    // quem entrou e aceitou o termo chega neles (fluxo em demographicsFlow).
    // Os dashboards e os painéis também: o login leva ao dashboard, e é a
    // guarda que mostra o termo no primeiro acesso.
    children: [
      { path: '/dashboard', element: <UserDashboardView /> },
      // A administradora tem o próprio dashboard, com o seletor de empresa e de
      // mentorando; a gestora, o da organização dela.
      { path: '/dashboard/company', element: <CompanyDashboardRoute /> },
      { path: '/control-panel', element: <CompanyControlPanelView /> },
      { path: '/control-panel/admin', element: <AdminControlPanelView /> },
      { path: '/demographics/step-1', element: <DemographicsStep1Route /> },
      { path: '/demographics/step-2', element: <DemographicsStep2Route /> },
      { path: '/demographics/step-3', element: <DemographicsStep3Route /> },
      { path: '/questionnaire', element: <QuestionnaireOnboardingView /> },
      { path: '/questionnaire/questions', element: <FormView /> },
      {
        path: '/questionnaire/review',
        element: <AnswersReviewRoute />,
      },
      {
        path: '/questionnaire/submitted',
        element: <SubmissionConfirmationView />,
      },
    ],
  },
  { path: '/about', element: <AboutView /> },
  { path: '/sign-up', element: <SignUpView /> },
  { path: '/awaiting-confirmation', element: <AwaitingConfirmationView /> },
  // Sem rota de primeiro acesso: a senha é definida na página do Keycloak,
  // pelo link do convite (P-012). Aqui só se pede o link de nova senha.
  { path: '/reset-password', element: <PasswordResetView /> },
]);
