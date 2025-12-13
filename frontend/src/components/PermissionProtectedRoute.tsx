import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PermissionProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions: string[];
}

export const PermissionProtectedRoute: React.FC<PermissionProtectedRouteProps> = ({ 
  children, 
  requiredPermissions 
}) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/staff/login" replace />;
  }

  // Superusers have all permissions
  if (user?.is_superuser) {
    return <>{children}</>;
  }

  // Check if user has any of the required permissions
  if (requiredPermissions.length > 0) {
    if (!user?.permissions) {
      // Redirect to first available page or members page as fallback
      return <Navigate to="/staff/members" replace />;
    }
    
    const hasPermission = requiredPermissions.some(perm => 
      user.permissions?.includes(perm)
    );
    
    if (!hasPermission) {
      // Redirect to first available page or members page as fallback
      return <Navigate to="/staff/members" replace />;
    }
  }

  return <>{children}</>;
};

