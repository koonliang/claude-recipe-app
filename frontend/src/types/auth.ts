export interface User {
  id: string;
  full_name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AnonymousAuthResponse {
  user: User;
  isAnonymous: true;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  full_name: string;
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
  field?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAnonymous: boolean;
}