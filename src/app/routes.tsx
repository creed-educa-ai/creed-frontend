import { createBrowserRouter } from 'react-router-dom';
import { RespondentesView } from '@/features/respondentes/RespondentesView';
import { BoasVindasView } from '@/features/boas-vindas/BoasVindasView';

// Features ainda não implementadas seguem o molde de respondentes.
export const router = createBrowserRouter([
  { path: '/', element: <BoasVindasView /> },
  { path: '/respondentes', element: <RespondentesView /> },
]);
