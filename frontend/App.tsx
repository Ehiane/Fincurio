
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Reflections from './pages/Reflections';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Only show navigation if authenticated and not on sign-in/onboarding */}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn onSignIn={() => setIsAuthenticated(true)} />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          <Route
            path="/app/*"
            element={
              isAuthenticated ? (
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
              ) : (
                <Navigate to="/signin" />
              )
            }
          />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
