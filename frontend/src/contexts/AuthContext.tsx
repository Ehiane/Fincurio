import { createContext, useState, useEffect, ReactNode } from 'react';
import { authApi, LoginRequest, RegisterRequest, AuthResponse } from '../api/auth.api';
import { userApi, UserProfile } from '../api/user.api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      createdAt: new Date().toISOString(),
    });
    userApi.getProfile().then(setUser).catch(() => {});
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
      createdAt: new Date().toISOString(),
    });
    userApi.getProfile().then(setUser).catch(() => {});
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    }
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
