import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

interface ProtectedRouteProps {
  enabled?: boolean;
}

export function ProtectedRoute({ enabled = true }: ProtectedRouteProps) {
  const user = useAppSelector((state) => state.authentication.user);
  const location = useLocation();

  if (enabled && !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
