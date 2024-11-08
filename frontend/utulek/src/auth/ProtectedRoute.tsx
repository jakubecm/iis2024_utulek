import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  requiredRole?: number; // defaults to admin (0)
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole = 0 }) => {
  const { isAuthenticated, role } = useAuth();
  console.log("protected role:", role);
  console.log("isAuthenticated:", isAuthenticated);

  // Check if the user is authenticated and has the required role
  if (!isAuthenticated || role !== requiredRole) {
    // Redirect to login if unauthenticated or unauthorized
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // Render child routes if authorized
};

export default ProtectedRoute;