import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './src/contexts/AuthContext';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Reflections from './pages/Reflections';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col md:flex-row">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/onboarding" element={<Onboarding />} />

            <Route
              path="/app/*"
              element={
                <PrivateRoute>
                  <div className="flex flex-1 flex-col md:flex-row h-screen overflow-hidden">
                    <Sidebar />
                    <div className="flex-1 overflow-y-auto">
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
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
