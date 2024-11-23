import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Role } from './jwt';

interface ProtectedRouteProps {
  requiredRoles: number[]; // defaults to admin (0)
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRoles }) => {
  const { isAuthenticated, role } = useAuth();
  console.log("protected role:", role);
  console.log("isAuthenticated:", isAuthenticated);
  console.log("requiredRoles:", requiredRoles);

  // Check if the user is authenticated and has the required role
  if (!isAuthenticated || role && !requiredRoles.includes(role)) {
    if (role && role === Role.VOLUNTEER && requiredRoles.includes(Role.VERIFIED_VOLUNTEER)) {
      return <Navigate to="/volunteer/forbidden" replace />;
    }

    // Redirect to login if unauthenticated or unauthorized
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // Render child routes if authorized
};

export default ProtectedRoute;