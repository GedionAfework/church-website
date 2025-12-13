import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserInfo } from '../services/authService';

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userInfo = await authService.checkAuth();
        setUser(userInfo);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      authService.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await authService.login({ username, password });
    localStorage.setItem('access_token', response.access);
    localStorage.setItem('refresh_token', response.refresh);
    const userInfo = await authService.checkAuth();
    setUser(userInfo);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user?.authenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

