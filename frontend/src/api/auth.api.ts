import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/api/user/profile');
    return response.data;
  },

  verifyEmail: async (token: string): Promise<VerifyEmailResponse> => {
    const response = await apiClient.post(`/api/auth/verify-email?token=${token}`);
    return response.data;
  },

  resendVerification: async (data: ResendVerificationRequest): Promise<ResendVerificationResponse> => {
    const response = await apiClient.post('/api/auth/resend-verification', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post('/api/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post('/api/auth/reset-password', data);
    return response.data;
  },
};
