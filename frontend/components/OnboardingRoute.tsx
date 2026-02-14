import { Navigate } from 'react-router-dom';
import { useAuth } from '../src/hooks/useAuth';

interface OnboardingRouteProps {
  children: React.ReactNode;
}

const OnboardingRoute: React.FC<OnboardingRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

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

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (user?.hasCompletedOnboarding) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};

export default OnboardingRoute;
