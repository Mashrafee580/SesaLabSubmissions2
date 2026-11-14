import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();
  if (isLoading) return <p className="py-16 text-center text-muted">Loading…</p>;
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return children;
}

export function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();
  if (isLoading) return <p className="py-16 text-center text-muted">Loading…</p>;
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
