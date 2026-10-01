import axios from 'axios';

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

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('studyzen_token');
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
            ?? 'No se pudo completar la petición.';
    }

    return error instanceof Error ? error.message : 'No se pudo completar la petición.';
}
