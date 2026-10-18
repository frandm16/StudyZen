import { api } from './api';
import type { AuthCredentials, RegisterCredentials, User, UpdateProfileDTO } from '../types/auth';

export const authService = {
    register: async (credentials: RegisterCredentials): Promise<void> => {
        await api.post('/auth/register', credentials);
    },

    login: async (credentials: AuthCredentials): Promise<void> => {
        await api.post('/auth/login', credentials);
    },

    requestPasswordReset: async (email: string): Promise<void> => {
        await api.post('/auth/forgot-password', { email });
    },

    resetPassword: async (token: string, password: string): Promise<void> => {
        await api.post('/auth/reset-password', { token, password });
    },

    verifyEmail: async (token: string): Promise<void> => {
        await api.post('/auth/verify-email', { token });
    },

    resendVerification: async (email: string): Promise<void> => {
        await api.post('/auth/resend-verification', { email });
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
    },

    refresh: async (): Promise<void> => {
        await api.post('/auth/refresh');
    },

    getMe: async (): Promise<User> => {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },

    updateProfile: async (data: UpdateProfileDTO): Promise<User> => {
        const response = await api.patch<User>('/auth/profile', data);
        return response.data;
    },

    getGoogleAuthUrl: (): string => {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
        return backendUrl ? `${backendUrl}/oauth2/authorize/google` : '/oauth2/authorize/google';
    },
};
