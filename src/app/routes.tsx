import { createBrowserRouter } from 'react-router-dom';
import { RespondentesView } from '@/features/respondentes/RespondentesView';
import { AlterarSenhaView } from '@/features/autenticacao/AlterarSenhaView';

// Features ainda não implementadas seguem o molde de respondentes.
export const router = createBrowserRouter([
  { path: '/', element: <RespondentesView /> },
  { path: '/respondentes', element: <RespondentesView /> },
  { path: '/primeiro-acesso', element: <AlterarSenhaView /> },
]);
