import { createBrowserRouter } from 'react-router-dom';
import { RespondentesView } from '@/features/respondentes/RespondentesView';
import { CadastroView } from '@/features/cadastro/CadastroView';

// Features ainda não implementadas seguem o molde de respondentes.
export const router = createBrowserRouter([
  { path: '/', element: <RespondentesView /> },
  { path: '/respondentes', element: <RespondentesView /> },
  { path: '/cadastro', element: <CadastroView /> },
]);
