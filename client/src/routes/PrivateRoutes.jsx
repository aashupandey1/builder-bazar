import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
}