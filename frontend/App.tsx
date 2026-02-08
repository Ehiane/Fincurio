import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './src/contexts/AuthContext';
import { useAuth } from './src/hooks/useAuth';
import Landing from './pages/Landing';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import SignIn from './pages/SignIn';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Reflections from './pages/Reflections';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';
import EmailVerificationBanner from './components/EmailVerificationBanner';
import SignOutOverlay from './src/components/SignOutOverlay';
import SignInOverlay from './src/components/SignInOverlay';

const AppRoutes: React.FC = () => {
  const { isSigningIn, isSigningOut } = useAuth();

  return (
    <>
      <SignInOverlay visible={isSigningIn} />
      <SignOutOverlay visible={isSigningOut} />
      <div className="min-h-screen flex flex-col md:flex-row">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />

          <Route
            path="/app/*"
            element={
              <PrivateRoute>
                <div className="flex flex-1 flex-col md:flex-row h-screen overflow-hidden">
                  <Sidebar />
                  <div className="flex-1 overflow-y-auto pt-14 lg:pt-0">
                    <EmailVerificationBanner />
                    <Routes>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="journal" element={<Journal />} />
                      <Route path="reflections" element={<Reflections />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="*" element={<Navigate to="dashboard" />} />
                    </Routes>
                  </div>
                </div>
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
