import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RespondentesView } from '@/features/respondentes/RespondentesView';
import { Demograficos2View } from '@/features/respondentes/Demograficos2View';
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
  {
    path: '/',
    element: loginHabilitado ? (
      <LoginView />
    ) : (
      <Navigate to="/respondentes" replace />
    ),
  },
  ...(loginHabilitado ? [{ path: '/login', element: <LoginView /> }] : []),
  {
    element: <ProtectedRoute enabled={loginHabilitado} />,
    children: [{ path: '/respondentes', element: <RespondentesView /> }],
  },
  { path: '/sobre', element: <SobreView /> },
  { path: '/boas-vindas', element: <BoasVindasView /> },
  { path: '/cadastro', element: <CadastroView /> },
  { path: '/primeiro-acesso', element: <AlterarSenhaView /> },
  { path: '/aguarde-confirmacao', element: <AguardeConfirmacaoView /> },
  { path: '/recuperar-senha', element: <AlterarSenhaView /> },
]);
