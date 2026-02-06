import { Navigate } from 'react-router-dom';
import { useAuth } from '../src/hooks/useAuth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#280905] via-[#3d0e08] to-[#280905]">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-white/10 rounded"></div>
          <div className="h-4 w-48 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/signin" replace />;
};

export default PrivateRoute;
