import { createContext, useState, useEffect, ReactNode } from 'react';
import { authApi, LoginRequest, RegisterRequest, AuthResponse } from '../api/auth.api';
import { userApi, UserProfile } from '../api/user.api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSigningIn: boolean;
  isSigningOut: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const userData = await userApi.getProfile();
          setUser(userData);
        } catch {
          localStorage.clear();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    const response: AuthResponse = await authApi.login(data);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);

    // Use auth response data immediately, fetch full profile in background
    setUser({
      id: response.userId,
      email: response.email,
      firstName: response.firstName || '',
      lastName: response.lastName || '',
      isEmailVerified: true,
      hasCompletedOnboarding: true,
      createdAt: new Date().toISOString(),
    });
    userApi.getProfile().then(setUser).catch(() => {});

    // Show sign-in overlay animation
    setIsSigningIn(true);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    setIsSigningIn(false);
  };

  const register = async (data: RegisterRequest) => {
    const response: AuthResponse = await authApi.register(data);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);

    // Use auth response data immediately, fetch full profile in background
    setUser({
      id: response.userId,
      email: response.email,
      firstName: response.firstName || '',
      lastName: response.lastName || '',
      isEmailVerified: false,
      hasCompletedOnboarding: false,
      createdAt: new Date().toISOString(),
    });
    userApi.getProfile().then(setUser).catch(() => {});
  };

  const refreshUser = async () => {
    try {
      const userData = await userApi.getProfile();
      setUser(userData);
    } catch {
      // Silently fail — user stays with current data
    }
  };

  const logout = async () => {
    setIsSigningOut(true);
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    }
    // Delay clearing state so the sign-out overlay can animate
    await new Promise((resolve) => setTimeout(resolve, 1400));
    localStorage.clear();
    setUser(null);
    setIsSigningOut(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, isSigningIn, isSigningOut, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
