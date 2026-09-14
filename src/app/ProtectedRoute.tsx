import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

interface ProtectedRouteProps {
  enabled?: boolean;
}

export function ProtectedRoute({ enabled = true }: ProtectedRouteProps) {
  const token = useAppSelector((state) => state.auth.token);
  const location = useLocation();

  if (enabled && !token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
