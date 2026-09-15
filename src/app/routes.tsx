import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RespondentesView } from '@/features/respondentes/RespondentesView';
import {
  Demograficos1Etapa,
  Demograficos2Etapa,
  Demograficos3Etapa,
} from '@/features/respondentes/fluxoDemograficos';
import { CadastroView } from '@/features/cadastro/CadastroView';
import { AlterarSenhaView } from '@/features/autenticacao/AlterarSenhaView';
import { SobreView } from '@/features/sobre/SobreView';
import { BoasVindasView } from '@/features/boas-vindas/BoasVindasView';
import { AguardeConfirmacaoView } from '@/features/aguarde-confirmacao/AguardeConfirmacaoView';
import { LoginView } from '@/features/authentication/LoginView';
import { QuestionarioPreviaView } from '@/features/questionario/QuestionarioPreviaView';
import { ProtectedRoute } from '@/app/ProtectedRoute';

const loginHabilitado = import.meta.env.VITE_LOGIN_ENABLED !== 'false';

export const router = createBrowserRouter([
  // > 🟡 Premissa P-014 — a plataforma abre na tela de boas-vindas, inclusive
  // > para quem já tem sessão. Confirmar na próxima reunião.
  { path: '/', element: <BoasVindasView /> },
  {
    path: '/login',
    // Com o login desligado, o botão "Entrar" das boas-vindas pula direto para
    // a área logada em vez de cair numa rota inexistente.
    element: loginHabilitado ? (
      <LoginView />
    ) : (
      <Navigate to="/respondentes" replace />
    ),
  },
  {
    element: <ProtectedRoute enabled={loginHabilitado} />,
    // Os dados demográficos ficam atrás da mesma guarda da área logada: só
    // quem entrou e aceitou o termo chega neles (fluxo em fluxoDemograficos).
    children: [
      { path: '/demograficos-1', element: <Demograficos1Etapa /> },
      { path: '/demograficos-2', element: <Demograficos2Etapa /> },
      { path: '/demograficos-3', element: <Demograficos3Etapa /> },
      // PROVISÓRIO — prévia estática do questionário, fim do fluxo da
      // apresentação.
      { path: '/questionario', element: <QuestionarioPreviaView /> },
      { path: '/respondentes', element: <RespondentesView /> },
    ],
  },
  { path: '/sobre', element: <SobreView /> },
  { path: '/cadastro', element: <CadastroView /> },
  { path: '/primeiro-acesso', element: <AlterarSenhaView /> },
  { path: '/aguarde-confirmacao', element: <AguardeConfirmacaoView /> },
  { path: '/recuperar-senha', element: <AlterarSenhaView /> },
]);
