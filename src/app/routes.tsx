import { createBrowserRouter } from 'react-router-dom';
import { RespondentesView } from '@/features/respondentes/RespondentesView';
import { Demograficos2View } from '@/features/respondentes/Demograficos2View';
import { Demograficos3View } from '@/features/respondentes/Demograficos3View';

// Features ainda não implementadas seguem o molde de respondentes.
export const router = createBrowserRouter([
  { path: '/', element: <RespondentesView /> },
  { path: '/respondentes', element: <RespondentesView /> },
  { path: '/demograficos-2', element: <Demograficos2View /> },
  { path: '/demograficos-3', element: <Demograficos3View /> },
]);
