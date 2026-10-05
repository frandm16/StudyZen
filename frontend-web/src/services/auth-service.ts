import { api } from './api';
import type { AuthResponse, AuthCredentials, RegisterCredentials, User, UpdateProfileDTO } from '../types/auth';

export const authService = {
    register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', {
            email: credentials.email,
            password: credentials.password,
            displayName: credentials.displayName,
        });
        const { accessToken } = response.data;
        if (accessToken) {
            localStorage.setItem('studyzen_token', accessToken);
        }
        return response.data;
    },

    login: async (credentials: AuthCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', {
            email: credentials.email,
            password: credentials.password,
        });
        const { accessToken } = response.data;
        if (accessToken) {
            localStorage.setItem('studyzen_token', accessToken);
        }
        return response.data;
    },

    logout: async (): Promise<void> => {
        localStorage.removeItem('studyzen_token');
        localStorage.removeItem('studyzen_refresh_token');
        localStorage.removeItem('studyzen_user');
    },

    refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/refresh', {
            refreshToken,
        });
        const { accessToken } = response.data;
        if (accessToken) {
            localStorage.setItem('studyzen_token', accessToken);
        }
        return response.data;
    },

    getMe: async (): Promise<User> => {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },

    updateProfile: async (data: UpdateProfileDTO): Promise<User> => {
        const response = await api.patch<User>('/auth/profile', data);
        return response.data;
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('studyzen_token');
    },

    getToken: (): string | null => {
        return localStorage.getItem('studyzen_token');
    },

    getGoogleAuthUrl: (): string => {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
        return backendUrl ? `${backendUrl}/oauth2/authorize/google` : '/oauth2/authorize/google';
    },
};
