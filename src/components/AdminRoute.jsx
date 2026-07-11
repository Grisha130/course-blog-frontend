import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!user.email_verified_at) return <Navigate to="/verify-email-notice" replace />;

  const hasRole = roles.some((r) => user.role?.includes(r));
  if (!hasRole) return <Navigate to="/" replace />;

  return children;
}