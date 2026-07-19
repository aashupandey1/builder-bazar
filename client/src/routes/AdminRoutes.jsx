import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoutes() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
}