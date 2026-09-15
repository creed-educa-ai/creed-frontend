import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RespondentesView } from '@/features/respondentes/RespondentesView';
import { Demograficos2View } from '@/features/respondentes/Demograficos2View';
import { Demograficos3View } from '@/features/respondentes/Demograficos3View';
import { CadastroView } from '@/features/cadastro/CadastroView';
import { AlterarSenhaView } from '@/features/autenticacao/AlterarSenhaView';
import { SobreView } from '@/features/sobre/SobreView';
import { BoasVindasView } from '@/features/boas-vindas/BoasVindasView';
import { AguardeConfirmacaoView } from '@/features/aguarde-confirmacao/AguardeConfirmacaoView';
import { LoginView } from '@/features/authentication/LoginView';
import { ProtectedRoute } from '@/app/ProtectedRoute';

const loginHabilitado = import.meta.env.VITE_LOGIN_ENABLED !== 'false';

export const router = createBrowserRouter([
  // Tela isolada da CREED-20.5; a guarda e o fluxo completo entram na CREED-20.7.
  { path: '/demograficos-2', element: <Demograficos2View /> },
  // Tela isolada da CREED-20.6, no mesmo esquema da anterior.
  { path: '/demograficos-3', element: <Demograficos3View /> },
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
    children: [{ path: '/respondentes', element: <RespondentesView /> }],
  },
  { path: '/sobre', element: <SobreView /> },
  { path: '/cadastro', element: <CadastroView /> },
  { path: '/primeiro-acesso', element: <AlterarSenhaView /> },
  { path: '/aguarde-confirmacao', element: <AguardeConfirmacaoView /> },
  { path: '/recuperar-senha', element: <AlterarSenhaView /> },
]);
