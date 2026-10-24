import axios, { type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15_000,
    withCredentials: true,
    headers: { Accept: 'application/json' },
});

let csrfRequest: Promise<string> | null = null;
let refreshRequest: Promise<void> | null = null;

interface AuthRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
    _skipCsrf?: boolean;
}

export async function getCsrfToken(): Promise<string> {
    if (!csrfRequest) {
        csrfRequest = axios.get<{ token: string }>(`${API_BASE_URL}/auth/csrf`, {
            withCredentials: true,
            headers: { Accept: 'application/json' },
        }).then(({ data }) => data.token).finally(() => {
            csrfRequest = null;
        });
    }
    return csrfRequest;
}

api.interceptors.request.use(async (config) => {
    const request = config as AuthRequestConfig;
    if (['post', 'put', 'patch', 'delete'].includes(request.method?.toLowerCase() ?? '') && !request._skipCsrf) {
        request.headers.set('X-XSRF-TOKEN', await getCsrfToken());
    }
    return request;
});

const isAuthEndpoint = (url = '') => ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'].some((path) => url.includes(path));

api.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
        if (!axios.isAxiosError(error) || error.response?.status !== 401) return Promise.reject(error);
        const originalRequest = error.config as AuthRequestConfig | undefined;
        if (!originalRequest || originalRequest._retry || isAuthEndpoint(originalRequest.url)) return Promise.reject(error);
        originalRequest._retry = true;
        try {
            if (!refreshRequest) {
                refreshRequest = api.post('/auth/refresh').then(() => undefined).finally(() => {
                    refreshRequest = null;
                });
            }
            await refreshRequest;
            return api(originalRequest);
        } catch (refreshError) {
            window.dispatchEvent(new Event('studyzen:session-expired'));
            return Promise.reject(refreshError);
        }
    },
);

const API_ERROR_FALLBACK = 'Something went wrong. Please try again.';

const STATUS_ERROR_MESSAGES: Record<number, string> = {
    400: 'Please check your information and try again.',
    401: 'Your session may have expired. Please sign in and try again.',
    403: 'You do not have permission to do that.',
    404: 'The requested information could not be found.',
    409: 'This change conflicts with existing information.',
    422: 'Please check your information and try again.',
    429: 'Too many requests. Please wait a moment and try again.',
};

export function getStructuredApiErrorMessage(error: unknown): string | null {
    if (!axios.isAxiosError<{ message?: unknown }>(error)) return null;

    const message = error.response?.data?.message;
    return typeof message === 'string' && message.trim() ? message.trim() : null;
}

export function getApiErrorMessage(error: unknown): string {
    const structuredMessage = getStructuredApiErrorMessage(error);
    if (structuredMessage) return structuredMessage;

    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status && STATUS_ERROR_MESSAGES[status]) return STATUS_ERROR_MESSAGES[status];
        if (status && status >= 500) return 'The service is temporarily unavailable. Please try again later.';
    }

    return API_ERROR_FALLBACK;
}
