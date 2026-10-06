import axios, { type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15_000,
    headers: {
        Accept: 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = typeof localStorage !== 'undefined'
        ? localStorage.getItem('studyzen_token')
        : null;
    if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as CustomAxiosRequestConfig | undefined;
        if (!originalRequest) {
            return Promise.reject(error);
        }

        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register') ||
            originalRequest.url?.includes('/auth/refresh') ||
            originalRequest.url?.includes('/auth/logout');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            const refreshToken = typeof localStorage !== 'undefined'
                ? localStorage.getItem('studyzen_refresh_token')
                : null;

            if (!refreshToken) {
                if (typeof localStorage !== 'undefined') {
                    localStorage.removeItem('studyzen_token');
                    localStorage.removeItem('studyzen_refresh_token');
                    localStorage.removeItem('studyzen_user');
                }
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((newToken) => {
                        originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post<{ accessToken: string; refreshToken?: string }>(
                    `${API_BASE_URL}/auth/refresh`,
                    { refreshToken }
                );

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('studyzen_token', accessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('studyzen_refresh_token', newRefreshToken);
                    }
                }

                api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
                originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
                processQueue(null, accessToken);

                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                if (typeof localStorage !== 'undefined') {
                    localStorage.removeItem('studyzen_token');
                    localStorage.removeItem('studyzen_refresh_token');
                    localStorage.removeItem('studyzen_user');
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export function getApiErrorMessage(error: unknown): string {
    if (axios.isAxiosError<{ message?: string; error?: string }>(error)) {
        return error.response?.data?.message
            ?? error.response?.data?.error
            ?? error.message
            ?? 'Request could not be completed.';
    }

    return error instanceof Error ? error.message : 'Request could not be completed.';
}
