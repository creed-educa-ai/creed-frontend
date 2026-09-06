import { createBrowserRouter } from 'react-router-dom';
import { RespondentesView } from '@/features/respondentes/RespondentesView';
import { WelcomeView } from '@/features/welcome/WelcomeView';

// Features ainda não implementadas seguem o molde de respondentes.
export const router = createBrowserRouter([
  { path: '/', element: <WelcomeView /> },
  { path: '/respondentes', element: <RespondentesView /> },
]);
