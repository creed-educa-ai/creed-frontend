import { createBrowserRouter } from 'react-router-dom';
import { RespondentesView } from '@/features/respondentes/RespondentesView';
import { BoasVindasView } from '@/features/boas-vindas/BoasVindasView';
import { CadastroView } from '@/features/cadastro/CadastroView';
import { AlterarSenhaView } from '@/features/autenticacao/AlterarSenhaView';
import { AguardeConfirmacaoView } from '@/features/aguarde-confirmacao/AguardeConfirmacaoView';

// Features ainda não implementadas seguem o molde de respondentes.
export const router = createBrowserRouter([
  { path: '/', element: <BoasVindasView /> },
  { path: '/respondentes', element: <RespondentesView /> },
  { path: '/cadastro', element: <CadastroView /> },
  { path: '/primeiro-acesso', element: <AlterarSenhaView /> },
  { path: '/aguarde-confirmacao', element: <AguardeConfirmacaoView /> },
]);
