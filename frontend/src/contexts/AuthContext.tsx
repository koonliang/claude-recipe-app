import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService } from '@/src/services/apiService';
import { User, AuthState, LoginCredentials, SignupData } from '@/src/types';
import { isAnonymousModeEnabled } from '@/src/config/appConfig';
import { mockAnonymousUser } from '@/src/data/mockData';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  checkAuthState: () => Promise<void>;
  loginAsAnonymous: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    isAnonymous: false,
  });

  const checkAuthState = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Check if anonymous mode is enabled and auto-login
      if (isAnonymousModeEnabled()) {
        setAuthState({
          user: mockAnonymousUser,
          token: null,
          isAuthenticated: true,
          isLoading: false,
          isAnonymous: true,
        });
        return;
      }
      
      const [token, user] = await Promise.all([
        apiService.getStoredToken(),
        apiService.getStoredUser(),
      ]);

      if (token && user) {
        setAuthState({
          user: user as User,
          token,
          isAuthenticated: true,
          isLoading: false,
          isAnonymous: false,
        });
      } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isAnonymous: false,
        });
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isAnonymous: false,
      });
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiService.login(credentials);
      
      setAuthState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        isAnonymous: false,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signup = async (userData: SignupData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiService.signup(userData);
      
      setAuthState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        isAnonymous: false,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      await apiService.logout();
      
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isAnonymous: false,
      });
    } catch (error) {
      // Even if logout fails, clear local state
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isAnonymous: false,
      });
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    await apiService.forgotPassword(email);
  };

  const resetPassword = async (token: string, newPassword: string) => {
    await apiService.resetPassword(token, newPassword);
  };

  const loginAsAnonymous = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      setAuthState({
        user: mockAnonymousUser,
        token: null,
        isAuthenticated: true,
        isLoading: false,
        isAnonymous: true,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  const contextValue: AuthContextType = {
    ...authState,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    checkAuthState,
    loginAsAnonymous,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}