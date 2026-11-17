import { useRouteError } from 'react-router-dom';
import { ErrorView } from '@/features/error/ErrorView';

// Entra como `errorElement` raiz em routes.tsx. A exceção vai só para o
// console: a tela é genérica e não mostra detalhe técnico a quem usa (P-023).
export function RouteErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  return <ErrorView />;
}
