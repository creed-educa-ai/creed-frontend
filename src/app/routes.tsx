import { createBrowserRouter } from 'react-router-dom';
import { RespondentesView } from '@/features/respondentes/RespondentesView';
import { Demograficos2View } from '@/features/respondentes/Demograficos2View';
import { Demograficos1View } from '@/features/respondentes/Demograficos1View';

// Features ainda não implementadas seguem o molde de respondentes.
export const router = createBrowserRouter([
  { path: '/', element: <RespondentesView /> },
  { path: '/respondentes', element: <RespondentesView /> },
  { path: '/demograficos-1', element: <Demograficos1View /> },
  { path: '/demograficos-2', element: <Demograficos2View /> },
]);
